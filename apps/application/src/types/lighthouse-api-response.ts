/* eslint-disable @typescript-eslint/no-explicit-any */
interface Metric {
  percentile: number;
  distributions: { min: number; max: number; proportion: number }[];
  category?: string;
}

interface LoadingExperience {
  id: string;
  metrics: {
    CUMULATIVE_LAYOUT_SHIFT_SCORE: Metric;
    EXPERIMENTAL_TIME_TO_FIRST_BYTE: Metric;
    FIRST_CONTENTFUL_PAINT_MS: Metric;
    INTERACTION_TO_NEXT_PAINT: Metric;
    FIRST_INPUT_DELAY_MS: Metric;
    LARGEST_CONTENTFUL_PAINT_MS: Metric;
  };
  overall_category: string;
  initial_url: string;
}

interface Environment {
  networkUserAgent: string;
  hostUserAgent: string;
  benchmarkIndex: number;
}

interface ConfigSettings {
  emulatedFormFactor: string;
  formFactor: string;
  locale: string;
  onlyCategories: string[];
  channel: string;
}

interface Audit {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  scoreDisplayMode: string;
  details?: any; // Pode ser mais detalhado se houver estrutura específica para os objetos de auditoria
  numericValue: number;
}

interface Audits {
  'offscreen-images': Audit;
  'total-blocking-time': Audit;
  'largest-contentful-paint': Audit;
  diagnostics: Audit;
  'third-party-summary': Audit;
  'cumulative-layout-shift': Audit;
  'uses-rel-preconnect': Audit;
  metrics: Audit;
  'total-byte-weight': Audit;
  'unminified-css': Audit;
  'long-tasks': Audit;
  'uses-passive-event-listeners': Audit;
  'final-screenshot': Audit;
  'efficient-animated-content': Audit;
  'first-meaningful-paint': Audit;
  'script-treemap-data': Audit;
  'bootup-time': Audit;
  'unused-css-rules': Audit;
  'resource-summary': Audit;
  'max-potential-fid': Audit;
  'unused-javascript': Audit;
  'mainthread-work-breakdown': Audit;
  'server-response-time': Audit;
  'lcp-lazy-loaded': Audit;
  'first-contentful-paint': Audit;
  'first-cpu-idle': Audit;
  'estimated-input-latency': Audit;
  'uses-long-cache-ttl': Audit;
  'font-display': Audit;
  'render-blocking-resources': Audit;
  'user-timings': Audit;
  'critical-request-chains': Audit;
  'duplicated-javascript': Audit;
  viewport: Audit;
  'network-rtt': Audit;
  'network-server-latency': Audit;
  'largest-contentful-paint-element': Audit;
  'screenshot-thumbnails': Audit;
  'main-thread-tasks': Audit;
  'network-requests': Audit;
  'prioritize-lcp-image': Audit;
  'speed-index': Audit;
  interactive: Audit;
  'non-composited-animations': Audit;
  'uses-optimized-images': Audit;
  'uses-responsive-images': Audit;
  'dom-size': Audit;
  'unsized-images': Audit;
  redirects: Audit;
  'uses-text-compression': Audit;
  'no-document-write': Audit;
  'third-party-facades': Audit;
  'legacy-javascript': Audit;
  'unminified-javascript': Audit;
  'layout-shifts': Audit;
  'modern-image-formats': Audit;
}

interface Categories {
  performance: {
    score: number;
    auditRefs: { id: string; weight: number; group?: string }[];
  };
}

interface CategoryGroups {
  diagnostics: { title: string };
  'a11y-navigation': { title: string };
  'seo-crawl': { title: string };
  'a11y-audio-video': { title: string };
  'a11y-names-labels': { title: string };
  'best-practices-browser-compat': { title: string };
  'seo-content': { title: string };
  'a11y-best-practices': { title: string };
  metrics: { title: string };
  'a11y-aria': { title: string };
  'a11y-tables-lists': { title: string };
  'best-practices-general': { title: string };
  'best-practices-ux': { title: string };
  'seo-mobile': { title: string };
  'a11y-color-contrast': { title: string };
  'best-practices-trust-safety': { title: string };
  'a11y-language': { title: string };
}

interface FullPageScreenshot {
  screenshot: { data: string };
  nodes: Record<string, any>;
}

export interface LighthouseResult {
  requestedUrl: string;
  finalUrl: string;
  mainDocumentUrl: string;
  finalDisplayedUrl: string;
  lighthouseVersion: string;
  userAgent: string;
  fetchTime: string;
  environment: Environment;
  runWarnings: string[];
  configSettings: ConfigSettings;
  audits: Audits;
  categories: Categories;
  categoryGroups: CategoryGroups;
  timing: { total: number };
  i18n: { rendererFormattedStrings: Record<string, string> };
  entities: Record<string, any>[];
  fullPageScreenshot: FullPageScreenshot;
}

export interface PerformanceResult {
  captchaResult: string;
  kind: string;
  id: string;
  loadingExperience: LoadingExperience;
  originLoadingExperience: LoadingExperience;
  lighthouseResult: LighthouseResult;
  analysisUTCTimestamp: string;
}
