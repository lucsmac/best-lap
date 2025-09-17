import { env } from "@best-lap/env"

interface ChannelData {
  id?: string;
  name: string;
  domain: string;
  internal_link: string;
  theme: string;
  active?: boolean;
  is_reference?: boolean;
  pages?: any[];
  created_at?: Date;
  updated_at?: Date;
}

export async function getThemesData(): Promise<ChannelData[]> {
  const themesResponse = await fetch(env.SEED_THEMES_URL)
  const themesList: string = await themesResponse.json() as string

  return JSON.parse(themesList)
}