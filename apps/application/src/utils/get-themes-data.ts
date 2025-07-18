import { ChannelEntity } from "../modules/channel/entity/channel-entity.interface"

export async function getThemesData(): Promise<ChannelEntity[]> {
  const themesResponse = await fetch('https://lucsmac.github.io/autodromo-domains/full_data.json')
  const themesList: string = await themesResponse.json() as string
  
  return JSON.parse(themesList)
}
