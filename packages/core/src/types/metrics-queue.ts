export type MetricsQueue = {
  setJob: (job: {
    type: string;
    data: any;
  }) => Promise<void>;
}