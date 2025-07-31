import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createChannelDocs, listChannelsDocs } from './docs'
import {
  listChannels,
  createChannel,
  deleteChannel,
  disableChannel, editChannel,
  enableChannel,
  listChannelsByTheme
} from './'
import { deleteChannelDocs } from './docs/delete'

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
  server.post('/:channel_id/enable', enableChannel)
  server.post('/:channel_id/disable', disableChannel)
  server.patch('/:channel_id', editChannel)
  server.get('/theme/:theme', listChannelsByTheme)
}
