import {
  SetCollectClientsChannelMetricsJobsUseCase,
  SetCollectReferencesChannelMetricsJobsUseCase
} from "@/application/usecases";
import { TypeormChannelsRepository } from "@/data/repositories/typeorm"

const channelsRepository = new TypeormChannelsRepository()

const setCollectClientsChannelMetricsJobsUseCase =
  new SetCollectClientsChannelMetricsJobsUseCase(channelsRepository)
  
const setCollectReferencesChannelMetricsJobsUseCase =
  new SetCollectReferencesChannelMetricsJobsUseCase(channelsRepository)

export async function setCollectMetricsJobs() {
  try {
    await setCollectClientsChannelMetricsJobsUseCase.execute();
  } catch (error) {
    console.error("Error while setting client channel metrics jobs:", error);
  }

  try {
    await setCollectReferencesChannelMetricsJobsUseCase.execute();
  } catch (error) {
    console.error("Error while setting reference channel metrics jobs:", error);
  }
}
