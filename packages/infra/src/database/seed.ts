import "reflect-metadata"
import { ChannelEntity, PageEntity } from "@best-lap/core"
import { TypeormChannelsRepository, TypeormPagesRepository } from "../typeorm"
import { getThemesData } from "../utils/get-themes-data"
import { connectToDatabase } from "./start-connection"

export async function seedDb() {
  try {
    const channelsSeedData: ChannelEntity[] = await getThemesData()
    const channelRepository = new TypeormChannelsRepository();
    const pageRepository = new TypeormPagesRepository()

    channelsSeedData.forEach(async (channelData: ChannelEntity) => {
      const channel = await channelRepository.create({ ...channelData, active: true })

      await pageRepository.create({
        name: "index",
        path: "/",
        channel_id: channel.id
      } as PageEntity)
    })

    console.log(`Database was seeded with ${channelsSeedData.length} channels`)
  } catch (error) {
    console.error(`Error when seed database * Error message: ${error}`)
  }
}

connectToDatabase().then(() => {
  seedDb()
}).catch((error) => {
  console.error('Error during database connection:', error);
});
