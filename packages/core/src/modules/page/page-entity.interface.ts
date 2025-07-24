import { MetricEntity } from "../metric";

export interface PageEntity {
  id?: string;
  name: string;
  path: string;
  channel_id: string;
  metrics?: MetricEntity[];
  created_at?: Date;
  updated_at?: Date;
}
