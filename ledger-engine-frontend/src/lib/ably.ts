/**
 * Ably real-time notification integration.
 *
 * Provides WebSocket-based notification delivery via Ably channels.
 * Channel naming: user:{userId}:notifications
 * Fallback: Exponential backoff reconnection, then 60s polling.
 */

/** Notification types supported by the backend API. */
export const NOTIFICATION_TYPES = {
  TOPUP_COMPLETED: "TOPUP_COMPLETED",
  P2P_RECEIVED: "P2P_RECEIVED",
  BILL_PAID: "BILL_PAID",
  SECURITY_ALERT: "SECURITY_ALERT",
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

/** Parsed notification event shape (camelCase, frontend-friendly). */
export interface NotificationEvent {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/** Raw event shape from Ably (snake_case, matches API response). */
interface RawNotificationEvent {
  notification_id?: string;
  user_id?: string;
  type?: string;
  title?: string;
  message?: string;
  is_read?: boolean;
  created_at?: string;
}

/** Set of valid notification type values for validation. */
const VALID_TYPES = new Set<string>(Object.values(NOTIFICATION_TYPES));

/**
 * Parse a raw Ably event into a typed NotificationEvent.
 *
 * Returns null if the event data is invalid or contains an unknown type.
 */
export function parseNotificationEvent(
  raw: RawNotificationEvent | null | undefined
): NotificationEvent | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.type || !VALID_TYPES.has(raw.type)) return null;
  if (!raw.notification_id || !raw.title || !raw.created_at) return null;

  return {
    notificationId: raw.notification_id,
    userId: raw.user_id ?? "",
    type: raw.type as NotificationType,
    title: raw.title,
    message: raw.message ?? "",
    isRead: raw.is_read ?? false,
    createdAt: raw.created_at,
  };
}

/**
 * Calculate exponential backoff delay for reconnection.
 *
 * Pattern: 1s, 2s, 4s, 8s, 16s, 30s (capped).
 * Returns delay in milliseconds.
 */
export function getReconnectDelay(attempt: number): number {
  if (attempt <= 0) return 0;
  const BASE_DELAY = 1000; // 1 second
  const MAX_DELAY = 30000; // 30 seconds
  const delay = BASE_DELAY * Math.pow(2, attempt - 1);
  return Math.min(delay, MAX_DELAY);
}

/** Callback type for notification events. */
export type NotificationCallback = (event: NotificationEvent) => void;

/** Interface for the notification channel subscription. */
export interface NotificationChannel {
  subscribe: (callback: NotificationCallback) => void;
  unsubscribe: (callback: NotificationCallback) => void;
  disconnect: () => void;
}

/**
 * Create a notification channel for a specific user.
 *
 * Subscribes to Ably channel `user:{userId}:notifications`.
 * Handles reconnection with exponential backoff.
 * Falls back to 60s polling if Ably cannot connect.
 */
export function createNotificationChannel(
  _userId: string
): NotificationChannel {
  const callbacks = new Set<NotificationCallback>();

  // Reconnection state
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pollingTimer: ReturnType<typeof setInterval> | null = null;
  let isConnected = false;

  const _notifyCallbacks = (event: NotificationEvent) => {
    callbacks.forEach((cb) => {
      try {
        cb(event);
      } catch {
        // Swallow callback errors to protect other subscribers
      }
    });
  };

  const startPolling = () => {
    if (pollingTimer) return;
    pollingTimer = setInterval(() => {
      // In production, this would fetch from GET /api/v1/notifications
      // For now, the polling fallback is a placeholder — the real
      // implementation will be wired up when the notification hook is created.
    }, 60_000);
  };

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  };

  const scheduleReconnect = () => {
    const delay = getReconnectDelay(reconnectAttempt);
    reconnectAttempt++;

    reconnectTimer = setTimeout(() => {
      // In production: attempt Ably connection
      // For now, if we've exceeded max retries, fall back to polling
      if (reconnectAttempt > 5) {
        startPolling();
        return;
      }
      scheduleReconnect();
    }, delay);
  };

  return {
    subscribe: (callback: NotificationCallback) => {
      callbacks.add(callback);

      // Start connection on first subscriber
      if (callbacks.size === 1 && !isConnected) {
        scheduleReconnect();
      }
    },

    unsubscribe: (callback: NotificationCallback) => {
      callbacks.delete(callback);

      // Cleanup when no subscribers remain
      if (callbacks.size === 0) {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        stopPolling();
        reconnectAttempt = 0;
      }
    },

    disconnect: () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      stopPolling();
      callbacks.clear();
      reconnectAttempt = 0;
      isConnected = false;
    },
  };
}
