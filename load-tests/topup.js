import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const topupSuccessRate = new Rate('topup_success_rate');
const topupDuration = new Trend('topup_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 VUs
    { duration: '5m', target: 50 },   // Stay at 50 VUs
    { duration: '2m', target: 250 },  // Ramp up to 250 VUs
    { duration: '5m', target: 250 },  // Stay at 250 VUs
    { duration: '2m', target: 500 },  // Ramp up to 500 VUs
    { duration: '10m', target: 500 }, // Stay at 500 VUs (500 TPS target)
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    topup_success_rate: ['rate>0.95'], // 95% success rate
    topup_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Setup function
export function setup() {
  console.log('Starting Top-Up Load Test');
  console.log(`Target: ${BASE_URL}`);

  return {
    walletId: '550e8400-e29b-41d4-a716-446655440000',
  };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`,
  };

  // Card Top-Up request
  const payload = JSON.stringify({
    walletId: data.walletId,
    amount: 50000.00,
    currency: 'COP',
    cardToken: `card-token-${Math.random().toString(36).substr(2, 9)}`,
    description: 'Load test top-up',
    correlationId: `topup-load-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/v1/topup/card`, payload, { headers });
  const duration = Date.now() - startTime;

  // Record metrics
  topupDuration.add(duration);

  const success = check(response, {
    'Top-up status is 201': (r) => r.status === 201,
    'Top-up has topUpId': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.topUpId !== undefined;
      } catch {
        return false;
      }
    },
  });

  topupSuccessRate.add(success);

  if (!success) {
    console.error(`Top-up failed: ${response.status} - ${response.body}`);
  }

  // Think time - 100ms to 300ms
  sleep(Math.random() * 0.2 + 0.1);
}

// Teardown function
export function teardown(data) {
  console.log('Top-Up Load Test Complete');
}