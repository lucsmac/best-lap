import { clientsQueue, mainQueue } from "@/infra/queue/queues";

export class DeleteChannelCollectJobService {
  async execute(channelId: string, is_reference: boolean) {
    try {
      const queue = is_reference ? mainQueue : clientsQueue

      const jobs = await queue.getJobs(['waiting', 'delayed', 'active']);
      const targetJob = jobs.find(job => job.data.channelId === channelId);
  
      if (!targetJob || !targetJob.repeatJobKey) return

      await queue.removeJobScheduler(targetJob.repeatJobKey);
    } catch (err) {
      console.error('Erro ao buscar ou remover jobs:', err);
    }
  }
}
