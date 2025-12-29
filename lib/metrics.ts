// lib/metrics.ts
import client from "prom-client";

interface GlobalWithMetrics {
  __AFFILIATEBASE_PROM_REGISTER__?: client.Registry;
}

const globalWithMetrics = globalThis as GlobalWithMetrics;

// Один общий реестр на процесс (для hot-reload)
export const register: client.Registry =
  globalWithMetrics.__AFFILIATEBASE_PROM_REGISTER__ || new client.Registry();

if (!globalWithMetrics.__AFFILIATEBASE_PROM_REGISTER__) {
  globalWithMetrics.__AFFILIATEBASE_PROM_REGISTER__ = register;

  client.collectDefaultMetrics({
    register,
    prefix: "affiliatebase_",
  });
}

// ---------- helpers, чтобы не создавать метрики второй раз ----------

function getOrCreateCounter<T extends string>(
  name: string,
  config: Omit<client.CounterConfiguration<T>, "name" | "registers">
): client.Counter<T> {
  const existing = register.getSingleMetric(name) as
    | client.Counter<T>
    | undefined;
  if (existing) return existing;

  return new client.Counter<T>({
    name,
    registers: [register],
    ...config,
  });
}

function getOrCreateGauge<T extends string>(
  name: string,
  config: Omit<client.GaugeConfiguration<T>, "name" | "registers">
): client.Gauge<T> {
  const existing = register.getSingleMetric(name) as
    | client.Gauge<T>
    | undefined;
  if (existing) return existing;

  return new client.Gauge<T>({
    name,
    registers: [register],
    ...config,
  });
}

function getOrCreateHistogram<T extends string>(
  name: string,
  config: Omit<client.HistogramConfiguration<T>, "name" | "registers">
): client.Histogram<T> {
  const existing = register.getSingleMetric(name) as
    | client.Histogram<T>
    | undefined;
  if (existing) return existing;

  return new client.Histogram<T>({
    name,
    registers: [register],
    ...config,
  });
}

// ---------- Метрики ----------

/** Total page views by program */
export const pageViewsTotal = getOrCreateCounter(
  "affiliatebase_page_views_total",
  {
    help: "Total number of unique page views",
    labelNames: ["program_id", "program_name"] as const,
  }
);

/** Total affiliate link clicks by program */
export const clicksTotal = getOrCreateCounter("affiliatebase_clicks_total", {
  help: "Total number of affiliate link clicks",
  labelNames: ["program_id", "program_name"] as const,
});

/** Blocked fraud attempts by reason */
export const fraudBlockedTotal = getOrCreateCounter(
  "affiliatebase_fraud_blocked_total",
  {
    help: "Total number of blocked fraud attempts",
    labelNames: ["program_id", "reason"] as const,
  }
);

/** Current number of active programs */
export const activeProgramsGauge = getOrCreateGauge(
  "affiliatebase_active_programs",
  {
    help: "Number of active programs",
  }
);

/** Total programs created */
export const programsCreatedTotal = getOrCreateCounter(
  "affiliatebase_programs_created_total",
  {
    help: "Total number of programs created",
  }
);
