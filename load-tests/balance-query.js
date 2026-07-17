import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const balanceQuerySuccessRate = new Rate('balance_query_success_rate');
const balanceQueryDuration = new Trend('balance_query_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 VUs
    { duration: '5m', target: 100 },   // Stay at 100 VUs
    { duration: '2m', target: 500 },   // Ramp up to 500 VUs
    { duration: '5m', target: 500 },   // Stay at 500 VUs
    { duration: '2m', target: 1000 },  // Ramp up to 1000 VUs
    { duration: '10m', target: 1000 }, // Stay at 1000 VUs (2000 TPS target with low think time)
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    balance_query_success_rate: ['rate>0.99'], // 99% success rate
    balance_query_duration: ['p(95)<200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Setup function
export function setup() {
  console.log('Starting Balance Query Load Test');
  console.log(`Target: ${BASE_URL}`);

  // Test wallet IDs
  const walletIds = [];
  for (let i = 0; i < 10; i++) {
    walletIds.push(`550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}`);
  }

  return { walletIds };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN || 'test-token'}`,
  };

  // Randomly select a wallet ID
  const walletId = data.walletIds[Math.floor(Math.random() * data.walletIds.length)];

  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/v1/wallets/${walletId}/balance`, { headers });
  const duration = Date.now() - startTime;

  // Record metrics
  balanceQueryDuration.add(duration);

  const success = check(response, {
    'Balance query status is 200': (r) => r.status === 200,
    'Balance query has balance': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.balance !== undefined;
      } catch {
        return false;
      }
    },
  });

  balanceQuerySuccessRate.add(success);

  if (!success) {
    console.error(`Balance query failed: ${response.status} - ${response.body}`);
  }

  // Think time - 10ms to 50ms (high throughput scenario)
  sleep(Math.random() * 0.04 + 0.01);
}

// Teardown function
export function teardown(data) {
  console.log('Balance Query Load Test Complete');
}