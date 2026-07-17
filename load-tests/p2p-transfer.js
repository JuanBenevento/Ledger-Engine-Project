import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const p2pTransferSuccessRate = new Rate('p2p_transfer_success_rate');
const p2pTransferDuration = new Trend('p2p_transfer_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 VUs
    { duration: '5m', target: 100 },  // Stay at 100 VUs
    { duration: '2m', target: 500 },  // Ramp up to 500 VUs
    { duration: '5m', target: 500 },  // Stay at 500 VUs
    { duration: '2m', target: 1000 }, // Ramp up to 1000 VUs
    { duration: '10m', target: 1000 }, // Stay at 1000 VUs (1000 TPS target)
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    p2p_transfer_success_rate: ['rate>0.95'], // 95% success rate
    p2p_transfer_duration: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Test data
const senderWalletIds = [];
const recipientIdentifiers = [];

// Setup function - runs once before the test
export function setup() {
  console.log('Starting P2P Transfer Load Test');
  console.log(`Target: ${BASE_URL}`);

  // In a real scenario, you would create test wallets here
  // For now, we'll use placeholder data
  return {
    senderWalletId: '550e8400-e29b-41d4-a716-446655440000',
    recipientIdentifier: 'recipient@test.com',
  };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`,
  };

  // P2P Transfer request
  const payload = JSON.stringify({
    senderWalletId: data.senderWalletId,
    recipientIdentifier: data.recipientIdentifier,
    amount: 1000.00,
    currency: 'COP',
    description: 'Load test transfer',
    correlationId: `load-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/v1/p2p/transfer`, payload, { headers });
  const duration = Date.now() - startTime;

  // Record metrics
  p2pTransferDuration.add(duration);

  const success = check(response, {
    'P2P transfer status is 201': (r) => r.status === 201,
    'P2P transfer has transfer ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.transferId !== undefined;
      } catch {
        return false;
      }
    },
  });

  p2pTransferSuccessRate.add(success);

  if (!success) {
    console.error(`P2P transfer failed: ${response.status} - ${response.body}`);
  }

  // Think time - 100ms to 500ms
  sleep(Math.random() * 0.4 + 0.1);
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log('P2P Transfer Load Test Complete');
}