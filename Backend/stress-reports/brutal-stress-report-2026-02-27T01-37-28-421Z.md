# Brutal Stress Test Report

- Generated At: 2026-02-27T01:37:28.419Z
- Base URL: http://localhost:5001
- Node Version: v22.14.0

## Overall

- Total Requests: 5950
- Total Errors: 830
- Error Rate: 13.95%
- Avg Throughput: 44.31 req/s
- Overall p95 Latency: 8538.6 ms

## Phase: warmup

- Description: Prime route handlers and in-memory caches
- Requests: 150
- Concurrency: 15
- Duration: 3626 ms
- Throughput: 41.37 req/s
- Error Rate: 0%
- Cache Hit Rate: 96%
- Latency (ms): p50=344.69, p95=554.55, p99=635.31

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| health | 25 | 0 | 346.05 | 519.34 |
| analytics | 25 | 0 | 364.98 | 557.7 |
| patient-stats | 25 | 0 | 357.56 | 554.55 |
| drug-stats | 25 | 0 | 347.21 | 491.73 |
| ml-stats | 25 | 0 | 340.57 | 483.08 |
| realtime-sources | 25 | 0 | 339.87 | 486.92 |

## Phase: cached-read-saturation

- Description: High-concurrency cached reads across analytics and knowledge endpoints
- Requests: 3200
- Concurrency: 120
- Duration: 30400.44 ms
- Throughput: 105.26 req/s
- Error Rate: 4.16%
- Cache Hit Rate: 99.63%
- Latency (ms): p50=32.45, p95=3552.62, p99=15011.65

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| analytics | 400 | 0 | 310.55 | 2414.25 |
| patient-stats | 400 | 0 | 312.27 | 2551.94 |
| all-patients | 400 | 0 | 324.5 | 2630.39 |
| drug-interactions | 400 | 0 | 318.16 | 2584.65 |
| contraindications | 400 | 0 | 330.75 | 2630.04 |
| dosage-guidelines | 400 | 0 | 337.47 | 2674.22 |
| ml-stats | 400 | 0 | 313.19 | 2540.93 |
| drug-lookup-aspirin | 400 | 33.25 | 5056.38 | 15013.26 |

## Phase: mixed-write-read

- Description: Concurrent writes plus reads to validate responsiveness under mutation load
- Requests: 900
- Concurrency: 45
- Duration: 75752.1 ms
- Throughput: 11.88 req/s
- Error Rate: 22.33%
- Cache Hit Rate: 97.88%
- Latency (ms): p50=40.29, p95=15017, p99=15048.27

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| analytics | 180 | 0 | 41.21 | 129.25 |
| ml-training-data | 180 | 0 | 42.34 | 129.46 |
| all-patients | 180 | 0 | 48.5 | 137.79 |
| drug-lookup-metformin | 180 | 11.67 | 1823.48 | 15020.64 |
| analyze-new-patient | 180 | 100 | 15012.27 | 15047.27 |

## Phase: lookup-and-realtime-blast

- Description: Burst test external-data lookups and realtime source endpoints
- Requests: 1700
- Concurrency: 85
- Duration: 90770.24 ms
- Throughput: 18.73 req/s
- Error Rate: 29.18%
- Cache Hit Rate: 99.06%
- Latency (ms): p50=25.22, p95=15030.24, p99=15060.07

| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |
|---|---:|---:|---:|---:|
| drug-lookup-lisinopril | 284 | 29.93 | 4512.82 | 15038.54 |
| drug-lookup-atorvastatin | 284 | 45.07 | 6774.72 | 15040.51 |
| ml-stats | 283 | 0 | 30.09 | 104.23 |
| patient-search | 283 | 0 | 32.19 | 104.65 |
| realtime-sources | 283 | 0 | 31.03 | 104.31 |
| drug-lookup-warfarin | 283 | 100 | 15010.43 | 15041.29 |
