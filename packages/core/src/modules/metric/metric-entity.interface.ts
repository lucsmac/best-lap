import { PageEntity } from "../page";

export interface MetricEntity {
  id?: string;
  time: Date;
  score: number;
  seo: number;
  response_time: number;
  fcp: number;
  si: number;
  lcp: number;
  tbt: number;
  cls: number;
  page: PageEntity;
}

export interface MetricEntityUnchecked {
  id?: string;
  time: Date;
  score: number;
  response_time: number;
  fcp: number;
  si: number;
  lcp: number;
  tbt: number;
  cls: number;
  page_id: string;
}
