/**
 * Prometheus Metrics Configuration
 * 
 * Exports metrics for monitoring application health and business KPIs.
 * Scraped by Prometheus via /api/metrics endpoint.
 */

import client from 'prom-client';

// =============================================================================
// Registry Setup
// =============================================================================

const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ 
  register,
  prefix: 'affiliatebase_',
});

// =============================================================================
// Business Metrics
// =============================================================================

/** Total page views by program */
export const pageViewsTotal = new client.Counter({
  name: 'affiliatebase_page_views_total',
  help: 'Total number of unique page views',
  labelNames: ['program_id', 'program_name'] as const,
  registers: [register],
});

/** Total affiliate link clicks by program */
export const clicksTotal = new client.Counter({
  name: 'affiliatebase_clicks_total',
  help: 'Total number of affiliate link clicks',
  labelNames: ['program_id', 'program_name'] as const,
  registers: [register],
});

/** Blocked fraud attempts by reason */
export const fraudBlockedTotal = new client.Counter({
  name: 'affiliatebase_fraud_blocked_total',
  help: 'Total number of blocked fraud attempts',
  labelNames: ['program_id', 'reason'] as const,
  registers: [register],
});

/** Current number of active programs */
export const activeProgramsGauge = new client.Gauge({
  name: 'affiliatebase_active_programs',
  help: 'Number of active programs',
  registers: [register],
});

/** Total programs created */
export const programsCreatedTotal = new client.Counter({
  name: 'affiliatebase_programs_created_total',
  help: 'Total number of programs created',
  registers: [register],
});

// =============================================================================
// Technical Metrics
// =============================================================================

/** API request duration histogram */
export const httpRequestDuration = new client.Histogram({
  name: 'affiliatebase_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/** API errors by route and type */
export const apiErrorsTotal = new client.Counter({
  name: 'affiliatebase_api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['route', 'error_type'] as const,
  registers: [register],
});

// =============================================================================
// Export
// =============================================================================

export { register };
