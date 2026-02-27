import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

type HttpMethod = 'GET' | 'POST';

interface Scenario {
  name: string;
  method: HttpMethod;
  route: string;
  expectedStatus?: number[];
  bodyFactory?: (requestIndex: number) => Record<string, unknown>;
}

interface PhaseConfig {
  name: string;
  description: string;
  totalRequests: number;
  concurrency: number;
  scenarios: Scenario[];
}

interface RequestMetric {
  scenario: string;
  status: number;
  latencyMs: number;
  cacheHeader: 'HIT' | 'MISS' | 'NONE';
  ok: boolean;
  error?: string;
}

interface PhaseResult {
  name: string;
  description: string;
  totalRequests: number;
  concurrency: number;
  durationMs: number;
  throughputRps: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  latencyMs: {
    min: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  scenarioBreakdown: Array<{
    name: string;
    requests: number;
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
  }>;
}

interface StressReport {
  generatedAt: string;
  baseUrl: string;
  nodeVersion: string;
  phases: PhaseResult[];
  overall: {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    avgThroughputRps: number;
    overallP95LatencyMs: number;
  };
}

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.STRESS_REQUEST_TIMEOUT_MS || '15000', 10);
const BASE_URL = (process.env.STRESS_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const REPORT_DIR = path.join(process.cwd(), 'stress-reports');

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[index].toFixed(2));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function randomChoice<T>(items: T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function buildAnalyzePayload(requestIndex: number): Record<string, unknown> {
  const medications = [
    { drugName: 'Metformin', dosage: '1000mg', frequency: 'BID', route: 'oral' },
    { drugName: 'Lisinopril', dosage: '20mg', frequency: 'QD', route: 'oral' },
    { drugName: 'Atorvastatin', dosage: '40mg', frequency: 'QHS', route: 'oral' },
    { drugName: 'Aspirin', dosage: '81mg', frequency: 'QD', route: 'oral' },
    { drugName: 'Nitroglycerin', dosage: '0.4mg', frequency: 'PRN', route: 'sublingual' },
  ];

  const conditionPool = [
    { condition: 'Hypertension', severity: 'moderate', controlled: true },
    { condition: 'Type 2 Diabetes', severity: 'moderate', controlled: true },
    { condition: 'Coronary Artery Disease', severity: 'severe', controlled: true },
    { condition: 'Chronic Kidney Disease', severity: 'moderate', controlled: false },
  ];

  const complaints = [
    'Erectile dysfunction for 6 months',
    'Chest discomfort with exertion for 2 weeks',
    'Fatigue and dizziness for 1 month',
    'Shortness of breath during activity for 3 weeks',
  ];

  const age = 38 + (requestIndex % 40);
  const weight = 60 + (requestIndex % 35);
  const height = 155 + (requestIndex % 20);
  const systolic = 110 + (requestIndex % 50);
  const diastolic = 68 + (requestIndex % 30);
  const heartRate = 62 + (requestIndex % 35);

  return {
    demographics: {
      age,
      sex: requestIndex % 2 === 0 ? 'male' : 'female',
      weight,
      height,
      bloodPressure: { systolic, diastolic },
      heartRate,
      temperature: 98.6,
    },
    medicalHistory: {
      conditions: conditionPool.slice(0, 2 + (requestIndex % 2)),
      allergies: [
        { allergen: 'Penicillin', reaction: 'Rash', severity: 'moderate' },
      ],
      surgeries: [],
      familyHistory: ['Heart disease'],
    },
    currentMedications: {
      medications: medications.slice(0, 2 + (requestIndex % 3)),
    },
    lifestyleFactors: {
      smokingStatus: randomChoice(['never', 'former', 'current']),
      packYears: requestIndex % 18,
      alcoholUse: randomChoice(['none', 'occasional', 'moderate']),
      drinksPerWeek: requestIndex % 8,
      exerciseLevel: randomChoice(['sedentary', 'light', 'moderate']),
      chiefComplaint: randomChoice(complaints),
      symptomDuration: `${1 + (requestIndex % 12)} weeks`,
      severity: 3,
      symptoms: ['fatigue', 'decreased exercise tolerance'],
    },
  };
}

const phases: PhaseConfig[] = [
  {
    name: 'warmup',
    description: 'Prime route handlers and in-memory caches',
    totalRequests: 150,
    concurrency: 15,
    scenarios: [
      { name: 'health', method: 'GET', route: '/api/health' },
      { name: 'analytics', method: 'GET', route: '/api/patients/analytics' },
      { name: 'patient-stats', method: 'GET', route: '/api/patients/statistics' },
      { name: 'drug-stats', method: 'GET', route: '/api/drug-database/stats' },
      { name: 'ml-stats', method: 'GET', route: '/api/ml/stats' },
      { name: 'realtime-sources', method: 'GET', route: '/api/realtime/sources' },
    ],
  },
  {
    name: 'cached-read-saturation',
    description: 'High-concurrency cached reads across analytics and knowledge endpoints',
    totalRequests: 3200,
    concurrency: 120,
    scenarios: [
      { name: 'analytics', method: 'GET', route: '/api/patients/analytics' },
      { name: 'patient-stats', method: 'GET', route: '/api/patients/statistics' },
      { name: 'all-patients', method: 'GET', route: '/api/patients' },
      { name: 'drug-interactions', method: 'GET', route: '/api/drug-database/interactions' },
      { name: 'contraindications', method: 'GET', route: '/api/drug-database/contraindications' },
      { name: 'dosage-guidelines', method: 'GET', route: '/api/drug-database/dosage-guidelines' },
      { name: 'drug-lookup-aspirin', method: 'GET', route: '/api/drug-database/lookup/aspirin' },
      { name: 'ml-stats', method: 'GET', route: '/api/ml/stats' },
    ],
  },
  {
    name: 'mixed-write-read',
    description: 'Concurrent writes plus reads to validate responsiveness under mutation load',
    totalRequests: 900,
    concurrency: 45,
    scenarios: [
      {
        name: 'analyze-new-patient',
        method: 'POST',
        route: '/api/treatment-plans/analyze',
        bodyFactory: (index) => buildAnalyzePayload(index),
      },
      { name: 'analytics', method: 'GET', route: '/api/patients/analytics' },
      { name: 'all-patients', method: 'GET', route: '/api/patients' },
      { name: 'drug-lookup-metformin', method: 'GET', route: '/api/drug-database/lookup/metformin' },
      { name: 'ml-training-data', method: 'GET', route: '/api/ml/training-data?limit=200' },
    ],
  },
  {
    name: 'lookup-and-realtime-blast',
    description: 'Burst test external-data lookups and realtime source endpoints',
    totalRequests: 1700,
    concurrency: 85,
    scenarios: [
      { name: 'drug-lookup-lisinopril', method: 'GET', route: '/api/drug-database/lookup/lisinopril' },
      { name: 'drug-lookup-atorvastatin', method: 'GET', route: '/api/drug-database/lookup/atorvastatin' },
      { name: 'drug-lookup-warfarin', method: 'GET', route: '/api/drug-database/lookup/warfarin' },
      { name: 'realtime-sources', method: 'GET', route: '/api/realtime/sources' },
      { name: 'ml-stats', method: 'GET', route: '/api/ml/stats' },
      { name: 'patient-search', method: 'GET', route: '/api/patients/search?q=diabetes' },
    ],
  },
];

async function executeScenarioRequest(
  scenario: Scenario,
  requestIndex: number,
): Promise<RequestMetric> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = performance.now();

  try {
    const body = scenario.bodyFactory?.(requestIndex);
    const response = await fetch(`${BASE_URL}${scenario.route}`, {
      method: scenario.method,
      headers: body
        ? { 'Content-Type': 'application/json' }
        : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    await response.text();

    const latencyMs = Number((performance.now() - start).toFixed(2));
    const cacheHeaderValue = response.headers.get('x-cache');
    const cacheHeader = cacheHeaderValue === 'HIT' || cacheHeaderValue === 'MISS'
      ? cacheHeaderValue
      : 'NONE';

    const okStatuses = scenario.expectedStatus || [];
    const ok = okStatuses.length > 0
      ? okStatuses.includes(response.status)
      : response.status >= 200 && response.status < 300;

    return {
      scenario: scenario.name,
      status: response.status,
      latencyMs,
      cacheHeader,
      ok,
    };
  } catch (error) {
    return {
      scenario: scenario.name,
      status: 0,
      latencyMs: Number((performance.now() - start).toFixed(2)),
      cacheHeader: 'NONE',
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown request error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function summarizePhase(phase: PhaseConfig, metrics: RequestMetric[], durationMs: number): PhaseResult {
  const latencies = metrics.map((metric) => metric.latencyMs);
  const statusCodes: Record<string, number> = {};
  const byScenario = new Map<string, RequestMetric[]>();

  let successCount = 0;
  let cacheHits = 0;
  let cacheMisses = 0;

  for (const metric of metrics) {
    if (metric.ok) successCount++;
    statusCodes[String(metric.status)] = (statusCodes[String(metric.status)] || 0) + 1;
    if (metric.cacheHeader === 'HIT') cacheHits++;
    if (metric.cacheHeader === 'MISS') cacheMisses++;

    const existing = byScenario.get(metric.scenario) || [];
    existing.push(metric);
    byScenario.set(metric.scenario, existing);
  }

  const errorCount = metrics.length - successCount;
  const errorRate = metrics.length > 0 ? Number(((errorCount / metrics.length) * 100).toFixed(2)) : 0;
  const throughputRps = durationMs > 0 ? Number(((metrics.length / durationMs) * 1000).toFixed(2)) : 0;
  const cacheTotal = cacheHits + cacheMisses;

  const scenarioBreakdown = [...byScenario.entries()].map(([name, items]) => {
    const scenarioLatencies = items.map((item) => item.latencyMs);
    const scenarioErrors = items.filter((item) => !item.ok).length;
    return {
      name,
      requests: items.length,
      errorRate: Number(((scenarioErrors / Math.max(1, items.length)) * 100).toFixed(2)),
      avgLatencyMs: average(scenarioLatencies),
      p95LatencyMs: percentile(scenarioLatencies, 95),
    };
  }).sort((a, b) => b.requests - a.requests);

  return {
    name: phase.name,
    description: phase.description,
    totalRequests: metrics.length,
    concurrency: phase.concurrency,
    durationMs: Number(durationMs.toFixed(2)),
    throughputRps,
    successCount,
    errorCount,
    errorRate,
    statusCodes,
    cache: {
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: cacheTotal > 0 ? Number(((cacheHits / cacheTotal) * 100).toFixed(2)) : 0,
    },
    latencyMs: {
      min: latencies.length > 0 ? Number(Math.min(...latencies).toFixed(2)) : 0,
      avg: average(latencies),
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies.length > 0 ? Number(Math.max(...latencies).toFixed(2)) : 0,
    },
    scenarioBreakdown,
  };
}

async function runPhase(phase: PhaseConfig): Promise<PhaseResult> {
  const metrics: RequestMetric[] = [];
  let requestCursor = 0;

  const start = performance.now();
  const workers = Array.from({ length: phase.concurrency }, async () => {
    let hasPendingRequests = true;
    while (hasPendingRequests) {
      const requestIndex = requestCursor++;
      if (requestIndex >= phase.totalRequests) {
        hasPendingRequests = false;
        continue;
      }

      const scenario = phase.scenarios[requestIndex % phase.scenarios.length];
      const metric = await executeScenarioRequest(scenario, requestIndex);
      metrics.push(metric);
    }
  });

  await Promise.all(workers);
  const durationMs = performance.now() - start;
  return summarizePhase(phase, metrics, durationMs);
}

async function assertServerReachable(): Promise<void> {
  const healthResponse = await fetch(`${BASE_URL}/api/health`);
  if (!healthResponse.ok) {
    throw new Error(`Health check failed with status ${healthResponse.status}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatPhaseConsoleSummary(phaseResult: PhaseResult): string {
  return [
    `Phase: ${phaseResult.name}`,
    `  Description: ${phaseResult.description}`,
    `  Requests: ${phaseResult.totalRequests} | Errors: ${phaseResult.errorCount} (${phaseResult.errorRate}%)`,
    `  Throughput: ${phaseResult.throughputRps} req/s`,
    `  Latency ms -> p50: ${phaseResult.latencyMs.p50}, p95: ${phaseResult.latencyMs.p95}, p99: ${phaseResult.latencyMs.p99}`,
    `  Cache -> HIT: ${phaseResult.cache.hits}, MISS: ${phaseResult.cache.misses}, hitRate: ${phaseResult.cache.hitRate}%`,
  ].join('\n');
}

function renderMarkdownReport(report: StressReport): string {
  const lines: string[] = [];
  lines.push('# Brutal Stress Test Report');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Base URL: ${report.baseUrl}`);
  lines.push(`- Node Version: ${report.nodeVersion}`);
  lines.push('');
  lines.push('## Overall');
  lines.push('');
  lines.push(`- Total Requests: ${report.overall.totalRequests}`);
  lines.push(`- Total Errors: ${report.overall.totalErrors}`);
  lines.push(`- Error Rate: ${report.overall.errorRate}%`);
  lines.push(`- Avg Throughput: ${report.overall.avgThroughputRps} req/s`);
  lines.push(`- Overall p95 Latency: ${report.overall.overallP95LatencyMs} ms`);
  lines.push('');

  for (const phase of report.phases) {
    lines.push(`## Phase: ${phase.name}`);
    lines.push('');
    lines.push(`- Description: ${phase.description}`);
    lines.push(`- Requests: ${phase.totalRequests}`);
    lines.push(`- Concurrency: ${phase.concurrency}`);
    lines.push(`- Duration: ${phase.durationMs} ms`);
    lines.push(`- Throughput: ${phase.throughputRps} req/s`);
    lines.push(`- Error Rate: ${phase.errorRate}%`);
    lines.push(`- Cache Hit Rate: ${phase.cache.hitRate}%`);
    lines.push(`- Latency (ms): p50=${phase.latencyMs.p50}, p95=${phase.latencyMs.p95}, p99=${phase.latencyMs.p99}`);
    lines.push('');
    lines.push('| Scenario | Requests | Error % | Avg Latency (ms) | P95 Latency (ms) |');
    lines.push('|---|---:|---:|---:|---:|');
    for (const item of phase.scenarioBreakdown) {
      lines.push(`| ${item.name} | ${item.requests} | ${item.errorRate} | ${item.avgLatencyMs} | ${item.p95LatencyMs} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  console.log(`Starting brutal stress test against ${BASE_URL}`);
  console.log(`Request timeout: ${REQUEST_TIMEOUT_MS}ms`);

  await assertServerReachable();
  console.log('Health check passed.');

  const phaseResults: PhaseResult[] = [];
  for (const phase of phases) {
    console.log(`\nRunning phase "${phase.name}" (${phase.totalRequests} requests @ concurrency ${phase.concurrency})`);
    const result = await runPhase(phase);
    phaseResults.push(result);
    console.log(formatPhaseConsoleSummary(result));
    await sleep(1200);
  }

  const allLatencies = phaseResults.flatMap((phase) => [phase.latencyMs.p95]);
  const totalRequests = phaseResults.reduce((sum, phase) => sum + phase.totalRequests, 0);
  const totalErrors = phaseResults.reduce((sum, phase) => sum + phase.errorCount, 0);
  const report: StressReport = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    nodeVersion: process.version,
    phases: phaseResults,
    overall: {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? Number(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
      avgThroughputRps: Number((phaseResults.reduce((sum, phase) => sum + phase.throughputRps, 0) / Math.max(1, phaseResults.length)).toFixed(2)),
      overallP95LatencyMs: average(allLatencies),
    },
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(REPORT_DIR, `brutal-stress-report-${stamp}.json`);
  const markdownPath = path.join(REPORT_DIR, `brutal-stress-report-${stamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(markdownPath, renderMarkdownReport(report), 'utf8');

  console.log('\nStress test completed.');
  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);

  if (report.overall.errorRate > 5) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error('Brutal stress test failed:', error);
  process.exit(1);
});
