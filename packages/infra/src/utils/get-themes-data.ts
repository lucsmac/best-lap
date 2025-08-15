import { ChannelEntity } from "@best-lap/core"
import { env } from "@best-lap/env"

export async function getThemesData(): Promise<ChannelEntity[]> {
  const themesResponse = await fetch(env.SEED_THEMES_URL)
  const themesList: string = await themesResponse.json() as string

  return JSON.parse(themesList)
}