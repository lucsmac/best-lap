import { PageEntity } from "../page";

export interface ChannelEntity {
  id?: string;
  name: string;
  domain: string;
  internal_link: string;
  theme: string;
  active: boolean;
  is_reference?: boolean;
  pages?: PageEntity[];
  created_at?: Date;
  updated_at?: Date;
}
