import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI State Store (Zustand).
 *
 * Manages non-server state:
 * - Sidebar open/close
 * - Dark mode toggle
 * - Locale preference
 *
 * Persisted to localStorage for user preference retention.
 */

interface UIState {
  /** Sidebar visibility state */
  sidebarOpen: boolean;
  /** Dark mode preference */
  darkMode: boolean;
  /** Locale preference (es, en) */
  locale: "es" | "en";

  /** Toggle sidebar visibility */
  toggleSidebar: () => void;
  /** Set sidebar state explicitly */
  setSidebarOpen: (open: boolean) => void;
  /** Toggle dark mode */
  toggleDarkMode: () => void;
  /** Set locale */
  setLocale: (locale: "es" | "en") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      darkMode: false,
      locale: "es",

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          // Apply to document
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDarkMode);
          }
          return { darkMode: newDarkMode };
        }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "ledger-engine-ui",
      // Only persist user preferences, not transient state
      partialize: (state) => ({
        darkMode: state.darkMode,
        locale: state.locale,
      }),
      // On rehydrate, apply dark mode class
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode && typeof document !== "undefined") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
