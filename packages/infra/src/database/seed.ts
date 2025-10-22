import "reflect-metadata"
import { getThemesData } from "../utils/get-themes-data"
import { connectToDatabase } from "./start-connection"
import { Channel } from "../typeorm/entities/channel-entity"
import { Page } from "../typeorm/entities/page-entity"
import { Provider } from "../typeorm/entities/provider-entity"

// Define interfaces locally to avoid runtime imports
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

interface PageData {
  id?: string;
  name: string;
  path: string;
  channel_id: string;
  provider_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function seedDb() {
  try {
    const dataSource = await connectToDatabase();

    const channelsSeedData: ChannelData[] = await getThemesData()

    const channelRepository = dataSource.getRepository(Channel);
    const pageRepository = dataSource.getRepository(Page);
    const providerRepository = dataSource.getRepository(Provider);

    // Create Autoforce provider
    const autoforceProvider = providerRepository.create({
      name: "Autoforce",
      website: "https://www.autoforce.com.br",
      slug: "autoforce",
      description: "Plataforma de criação de sites automotivos"
    });
    const savedProvider = await providerRepository.save(autoforceProvider);

    await Promise.all(
      channelsSeedData.map(async (channelData: ChannelData) => {
        const channelEntity = channelRepository.create({ ...channelData, active: true });
        const savedChannel = await channelRepository.save(channelEntity);

        const pageEntity = pageRepository.create({
          name: "index",
          path: "/",
          channel_id: savedChannel.id,
          provider_id: savedProvider.id
        } as PageData);

        await pageRepository.save(pageEntity);
      })
    );

    console.log(`Database was seeded with ${channelsSeedData.length} channels`)
    console.log(`All pages assigned to provider: ${savedProvider.name}`)
  } catch (error) {
    console.error(`Error when seed database * Error message: ${error}`)
    process.exit(1);
  }
}

// Execute seed
seedDb().catch((error) => {
  console.error('Error during database seeding:', error);
  process.exit(1);
});
