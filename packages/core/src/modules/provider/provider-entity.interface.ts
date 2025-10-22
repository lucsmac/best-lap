import { PageEntity } from "../page";

export interface ProviderEntity {
  id?: string;
  name: string;
  website: string;
  slug: string;
  description?: string;
  pages?: PageEntity[];
  created_at?: Date;
  updated_at?: Date;
}
