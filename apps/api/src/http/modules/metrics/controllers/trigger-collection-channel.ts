import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository, BullMqPageMetricsQueue, queuesMap } from "@best-lap/infra";
import { triggerCollectionParamsSchema } from "../utils/trigger-collection-schemas";

export async function triggerCollectionChannel(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id } = triggerCollectionParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository();
    const pageMetricsQueue = new BullMqPageMetricsQueue(queuesMap);

    // Buscar o canal específico com suas páginas
    const channel = await channelsRepository.findById(channel_id);

    if (!channel) {
      return reply.code(404).send({
        message: 'Channel not found',
      });
    }

    if (!channel.active) {
      return reply.code(400).send({
        message: 'Channel is not active',
      });
    }

    if (!channel.internal_link) {
      return reply.code(400).send({
        message: 'Channel does not have a URL',
      });
    }

    if (!channel.pages || channel.pages.length === 0) {
      return reply.code(400).send({
        message: 'Channel does not have any pages',
      });
    }

    let jobsCount = 0;

    // Enfileirar jobs para todas as páginas do canal
    for (const page of channel.pages) {
      if (!page.path) {
        console.warn(`Page with ID ${page.id} does not have a path, skipping metrics collection.`);
        continue;
      }

      const collectPageMetricsJobParams = {
        pageUrl: `${channel.internal_link}${page.path}`,
        pageId: page.id!,
      };

      try {
        await pageMetricsQueue.setCollectPageMetricsJob({
          type: channel.is_reference ? 'reference' : 'client',
          data: collectPageMetricsJobParams
        });

        jobsCount++;
        console.log(`Metrics collection job added for page: ${collectPageMetricsJobParams.pageUrl}`);
      } catch (error) {
        console.error(`Error adding metrics collection job for page: ${collectPageMetricsJobParams.pageUrl}`, error);
      }
    }

    return reply.code(200).send({
      message: `Successfully enqueued ${jobsCount} metrics collection jobs for channel`,
      jobs_count: jobsCount,
      channel_id,
    });
  } catch (error) {
    console.error('Error triggering collection for channel:', error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
