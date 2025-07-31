import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createChannelDocs, listChannelDocs } from './docs'
import {
  listChannels,
  createChannel,
  deleteChannel,
  disableChannel, editChannel,
  enableChannel,
  listChannelsByTheme
} from './'

export async function channelsRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/', listChannelDocs, listChannels)
  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/', createChannelDocs, createChannel)
  server.delete('/:channel_id', deleteChannel)
  server.post('/:channel_id/enable', enableChannel)
  server.post('/:channel_id/disable', disableChannel)
  server.patch('/:channel_id', editChannel)
  server.get('/theme/:theme', listChannelsByTheme)
}
