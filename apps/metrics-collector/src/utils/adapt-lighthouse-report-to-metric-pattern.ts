import { LighthouseResult } from "@best-lap/core";

export const adaptLighthouseResultToMetricPattern = (lighthouseResult: LighthouseResult) => {
  const performanceScore = lighthouseResult.categories.performance.score
  const resultAudits = lighthouseResult.audits
  const responseTime = resultAudits['server-response-time'].numericValue;
  const fcp = resultAudits['first-contentful-paint'].numericValue
  const si = resultAudits['speed-index'].numericValue;
  const lcp = resultAudits['largest-contentful-paint'].numericValue;
  const tbt = resultAudits['total-blocking-time'].numericValue;
  const cls = resultAudits['cumulative-layout-shift'].numericValue;

  const metrics = {
    score: performanceScore * 100,
    responseTime: responseTime,
    fcp,
    si,
    lcp,
    tbt,
    cls
  }

  return metrics
}