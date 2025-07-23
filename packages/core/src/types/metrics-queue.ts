export interface CollectPageMetricsJobParams {
  type: 'client' | 'reference';
  data: CollectPageMetricsJobData;
}

type CollectPageMetricsJobData = {
  pageUrl: string
  pageId: string
}

export type PageMetricsQueue = {
  setCollectPageMetricsJob: (job: CollectPageMetricsJobParams) => Promise<void>;
}
