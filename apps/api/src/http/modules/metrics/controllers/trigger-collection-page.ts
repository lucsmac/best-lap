import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormChannelsRepository, TypeormPagesRepository, BullMqPageMetricsQueue, queuesMap } from "@best-lap/infra";
import { triggerCollectionPageParamsSchema } from "../utils/trigger-collection-schemas";

export async function triggerCollectionPage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { channel_id, page_id } = triggerCollectionPageParamsSchema.parse(request.params);

    const channelsRepository = new TypeormChannelsRepository();
    const pagesRepository = new TypeormPagesRepository();
    const pageMetricsQueue = new BullMqPageMetricsQueue(queuesMap);

    // Buscar o canal
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

    // Buscar a página específica
    const page = await pagesRepository.findById(page_id);

    if (!page) {
      return reply.code(404).send({
        message: 'Page not found',
      });
    }

    if (page.channel_id !== channel_id) {
      return reply.code(400).send({
        message: 'Page does not belong to the specified channel',
      });
    }

    if (!page.path) {
      return reply.code(400).send({
        message: 'Page does not have a path',
      });
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

      console.log(`Metrics collection job added for page: ${collectPageMetricsJobParams.pageUrl}`);

      return reply.code(200).send({
        message: 'Successfully enqueued metrics collection job for page',
        jobs_count: 1,
        channel_id,
        page_id,
      });
    } catch (error) {
      console.error(`Error adding metrics collection job for page: ${collectPageMetricsJobParams.pageUrl}`, error);
      return reply.code(500).send({ error: 'Failed to enqueue metrics collection job' });
    }
  } catch (error) {
    console.error('Error triggering collection for page:', error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
}
