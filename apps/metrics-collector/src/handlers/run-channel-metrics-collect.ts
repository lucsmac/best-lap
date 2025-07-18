import { Job } from "bullmq"
import { TypeormMetricsRepository } from "@/data/repositories/typeorm";
import { CreateCollectMetricsJob } from "@/application/services";

export const runChannelMetricsCollect = async (job: Job) => {
  const { channelUrl, channelId } = job.data;

  try {
    const metricsRepository = new TypeormMetricsRepository()
    const createCollectMetricsJob = new CreateCollectMetricsJob(metricsRepository)
    
    await createCollectMetricsJob.execute(channelUrl, channelId)
  } catch(error) {
    console.error(`Error fetching or processing metrics for channel: ${channelUrl}`, error);
  }
}
