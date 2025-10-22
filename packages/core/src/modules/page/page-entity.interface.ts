import { MetricEntity } from "../metric";
import { ProviderEntity } from "../provider";

export interface PageEntity {
  id?: string;
  name: string;
  path: string;
  channel_id: string;
  provider_id?: string;
  metrics?: MetricEntity[];
  provider?: ProviderEntity;
  created_at?: Date;
  updated_at?: Date;
}
