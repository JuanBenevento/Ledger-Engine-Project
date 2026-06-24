# Load Tests for Ledger Engine

This directory contains load test scripts for the Ledger Engine platform using [k6](https://k6.io/).

## Prerequisites

1. Install k6: https://k6.io/docs/getting-started/installation/
2. Start the Ledger Engine application
3. Set environment variables (optional)

## Environment Variables

- `BASE_URL`: The base URL of the Ledger Engine API (default: `http://localhost:8080`)
- `AUTH_TOKEN`: JWT token for authentication (default: `test-token`)

## Test Scenarios

### 1. P2P Transfers (`p2p-transfer.js`)

**Target**: 1000 TPS sustained for 10 minutes

**Scenario**:
- Ramp up to 100 VUs over 2 minutes
- Stay at 100 VUs for 5 minutes
- Ramp up to 500 VUs over 2 minutes
- Stay at 500 VUs for 5 minutes
- Ramp up to 1000 VUs over 2 minutes
- Stay at 1000 VUs for 10 minutes
- Ramp down to 0 over 2 minutes

**Thresholds**:
- 95% of requests under 500ms
- 95% success rate

**Run**:
```bash
k6 run p2p-transfer.js
```

### 2. Top-Up Operations (`topup.js`)

**Target**: 500 TPS sustained for 10 minutes

**Scenario**:
- Ramp up to 50 VUs over 2 minutes
- Stay at 50 VUs for 5 minutes
- Ramp up to 250 VUs over 2 minutes
- Stay at 250 VUs for 5 minutes
- Ramp up to 500 VUs over 2 minutes
- Stay at 500 VUs for 10 minutes
- Ramp down to 0 over 2 minutes

**Thresholds**:
- 95% of requests under 1s
- 95% success rate

**Run**:
```bash
k6 run topup.js
```

### 3. Balance Queries (`balance-query.js`)

**Target**: 2000 TPS sustained for 10 minutes

**Scenario**:
- Ramp up to 100 VUs over 2 minutes
- Stay at 100 VUs for 5 minutes
- Ramp up to 500 VUs over 2 minutes
- Stay at 500 VUs for 5 minutes
- Ramp up to 1000 VUs over 2 minutes
- Stay at 1000 VUs for 10 minutes
- Ramp down to 0 over 2 minutes

**Thresholds**:
- 95% of requests under 200ms
- 99% success rate

**Run**:
```bash
k6 run balance-query.js
```

## Running All Tests

```bash
k6 run p2p-transfer.js
k6 run topup.js
k6 run balance-query.js
```

## Results Analysis

k6 outputs results to stdout. For detailed analysis, you can:

1. Use k6 Cloud: https://cloud.k6.io/
2. Export results to InfluxDB: https://k6.io/docs/results-output/influxdb/
3. Use the built-in JSON output: `k6 run --out json=results.json script.js`

## Bottlenecks to Watch

1. **Database**: Monitor PostgreSQL connection pool and query performance
2. **Redis**: Check cache hit rates and memory usage
3. **RabbitMQ**: Monitor queue depths and consumer lag
4. **CPU/Memory**: Watch JVM garbage collection and memory pressure
5. **Network**: Check for connection timeouts and latency spikes

## Expected Results

Based on the system design:

- **P2P Transfers**: Should achieve 1000 TPS with < 500ms p95 latency
- **Top-Up Operations**: Should achieve 500 TPS with < 1s p95 latency
- **Balance Queries**: Should achieve 2000 TPS with < 200ms p95 latency (cached)

## Notes

- Tests use correlation IDs for idempotency
- Each request generates a unique correlation ID to avoid duplicate detection
- Think times are randomized to simulate real user behavior
- Thresholds fail the test if performance degrades beyond acceptable limits