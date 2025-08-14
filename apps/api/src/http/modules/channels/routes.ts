import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  createChannelDocs,
  listChannelsDocs,
  deleteChannelDocs,
  editChannelDocs,
  enableChannelDocs,
  disableChannelDocs,
  listChannelsByThemeDocs,
  showChannelDocs
} from './docs'
import {
  listChannels,
  createChannel,
  deleteChannel,
  disableChannel,
  editChannel,
  enableChannel,
  listChannelsByTheme,
  showChannel
} from './controllers'

export async function channelsRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/', listChannelsDocs, listChannels)

  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/:channel_id', showChannelDocs, showChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/', createChannelDocs, createChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:channel_id', deleteChannelDocs, deleteChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:channel_id/enable', enableChannelDocs, enableChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:channel_id/disable', disableChannelDocs, disableChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:channel_id', editChannelDocs, editChannel)

  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/theme/:theme', listChannelsByThemeDocs, listChannelsByTheme)
}
