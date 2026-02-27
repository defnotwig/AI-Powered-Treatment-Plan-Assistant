# Brutal Stress Test Report

- Generated At: 2026-02-27T01:32:57.523Z
- Base URL: http://localhost:5000
- Node Version: v22.14.0

## Overall

- Total Requests: 5950
- Total Errors: 5852
- Error Rate: 98.35%
- Avg Throughput: 805.75 req/s
- Overall p95 Latency: 409.95 ms

## Phase: warmup

- Description: Prime route handlers and in-memory caches
- Requests: 150
- Concurrency: 15
- Duration: 3505.13 ms
- Throughput: 42.79 req/s
- Error Rate: 34.67%
- Cache Hit Rate: 93.88%
- Latency (ms): p50=57.17, p95=1065.33, p99=1194.57

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| health | 25 | 32 | 340.41 | 1035.7 |
| analytics | 25 | 32 | 332.67 | 932.45 |
| patient-stats | 25 | 36 | 339.53 | 964.14 |
| drug-stats | 25 | 36 | 346.43 | 1190.14 |
| ml-stats | 25 | 36 | 325.75 | 1075.22 |
| realtime-sources | 25 | 36 | 321.95 | 1020.66 |

## Phase: cached-read-saturation

- Description: High-concurrency cached reads across analytics and knowledge endpoints
- Requests: 3200
- Concurrency: 120
- Duration: 3431.78 ms
- Throughput: 932.46 req/s
- Error Rate: 100%
- Cache Hit Rate: 0%
- Latency (ms): p50=96.06, p95=333.87, p99=436.96

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| analytics | 400 | 100 | 128.22 | 334.72 |
| patient-stats | 400 | 100 | 127.97 | 334.65 |
| all-patients | 400 | 100 | 127.51 | 335.23 |
| drug-interactions | 400 | 100 | 126.74 | 324.34 |
| contraindications | 400 | 100 | 126.34 | 328.61 |
| dosage-guidelines | 400 | 100 | 126.53 | 329.65 |
| drug-lookup-aspirin | 400 | 100 | 127.27 | 333.87 |
| ml-stats | 400 | 100 | 127.49 | 329.93 |

## Phase: mixed-write-read

- Description: Concurrent writes plus reads to validate responsiveness under mutation load
- Requests: 900
- Concurrency: 45
- Duration: 948.61 ms
- Throughput: 948.75 req/s
- Error Rate: 100%
- Cache Hit Rate: 0%
- Latency (ms): p50=37.07, p95=119.07, p99=166.18

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| analytics | 180 | 100 | 46.51 | 111.29 |
| all-patients | 180 | 100 | 46.54 | 118.18 |
| drug-lookup-metformin | 180 | 100 | 46.54 | 118.45 |
| ml-training-data | 180 | 100 | 46.54 | 119.07 |
| analyze-new-patient | 180 | 100 | 47.7 | 113.53 |

## Phase: lookup-and-realtime-blast

- Description: Burst test external-data lookups and realtime source endpoints
- Requests: 1700
- Concurrency: 85
- Duration: 1308.69 ms
- Throughput: 1299.01 req/s
- Error Rate: 100%
- Cache Hit Rate: 0%
- Latency (ms): p50=57.53, p95=121.54, p99=161.56

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| drug-lookup-lisinopril | 284 | 100 | 64.59 | 119.67 |
| drug-lookup-atorvastatin | 284 | 100 | 64.36 | 120.25 |
| drug-lookup-warfarin | 283 | 100 | 64.54 | 120.55 |
| realtime-sources | 283 | 100 | 64.56 | 121.51 |
| ml-stats | 283 | 100 | 64.59 | 121.54 |
| patient-search | 283 | 100 | 65.35 | 122.43 |
