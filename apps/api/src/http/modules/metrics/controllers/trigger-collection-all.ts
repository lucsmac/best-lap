import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository, BullMqPageMetricsQueue, queuesMap } from "@best-lap/infra";

export async function triggerCollectionAll(request: FastifyRequest, reply: FastifyReply) {
  try {
    const channelsRepository = new TypeormChannelsRepository();
    const pageMetricsQueue = new BullMqPageMetricsQueue(queuesMap);

    // Buscar todos os canais ativos com suas páginas "/" em uma única query
    const activeChannels = await channelsRepository.listActiveChannelsWithHomePage();

    if (activeChannels.length === 0) {
      return reply.code(200).send({
        message: 'No active channels found for metrics collection',
        jobs_count: 0,
      });
    }

    let jobsCount = 0;

    // Enfileirar job apenas para a página "/" de cada canal
    for (const channel of activeChannels) {
      if (!channel.internal_link) {
        console.warn(`Channel with ID ${channel.id} does not have a URL, skipping metrics collection.`);
        continue;
      }

      // Verificar se a página "/" foi carregada no JOIN
      const homePage = channel.pages?.[0];

      if (!homePage) {
        console.warn(`Channel with ID ${channel.id} does not have a home page (/), skipping metrics collection.`);
        continue;
      }

      const collectPageMetricsJobParams = {
        pageUrl: `${channel.internal_link}/`,
        pageId: homePage.id!,
      };

      try {
        await pageMetricsQueue.setCollectPageMetricsJob({
          type: channel.is_reference ? 'reference' : 'client',
          data: collectPageMetricsJobParams
        });

        jobsCount++;
        console.log(`Metrics collection job added for channel home page: ${collectPageMetricsJobParams.pageUrl}`);
      } catch (error) {
        console.error(`Error adding metrics collection job for channel: ${collectPageMetricsJobParams.pageUrl}`, error);
      }
    }

    return reply.code(200).send({
      message: `Successfully enqueued ${jobsCount} metrics collection jobs for ${activeChannels.length} channels`,
      jobs_count: jobsCount,
    });
  } catch (error) {
    console.error('Error triggering collection for all channels:', error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
