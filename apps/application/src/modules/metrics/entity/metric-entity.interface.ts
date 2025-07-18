import { ChannelEntity } from "../../channel/entity/channel-entity.interface";

export interface MetricEntity {
  id?: string;
  time: Date;
  score: number;
  responseTime: number;
  fcp: number;
  si: number;
  lcp: number;
  tbt: number;
  cls: number;
  channel: ChannelEntity;
}

export interface MetricEntityUnchecked {
  id?: string;
  time: Date;
  score: number;
  responseTime: number;
  fcp: number;
  si: number;
  lcp: number;
  tbt: number;
  cls: number;
  channel_id: string;
}
