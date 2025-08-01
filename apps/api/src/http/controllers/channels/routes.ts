import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  createChannelDocs,
  listChannelsDocs,
  deleteChannelDocs,
  editChannelDocs,
  enableChannelDocs,
  disableChannelDocs,
  listChannelsByThemeDocs
} from './docs'
import {
  listChannels,
  createChannel,
  deleteChannel,
  disableChannel,
  editChannel,
  enableChannel,
  listChannelsByTheme
} from './'

export async function channelsRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/', listChannelsDocs, listChannels)
  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/', createChannelDocs, createChannel)
  server
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:channel_id', deleteChannelDocs, deleteChannel)
  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/:channel_id/enable', enableChannelDocs, enableChannel)
  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/:channel_id/disable', disableChannelDocs, disableChannel)
  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:channel_id', editChannelDocs, editChannel)
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/theme/:theme', listChannelsByThemeDocs, listChannelsByTheme)
}
