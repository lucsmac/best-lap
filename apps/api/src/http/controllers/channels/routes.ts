import { FastifyInstance } from 'fastify'
import { listChannels } from './list'
import { listChannelsByTheme } from './list-by-theme'
import { createChannel } from './create'
import { deleteChannel } from './delete'
import { editChannel } from './edit'
import { disableChannel } from './disable-channel'
import { enableChannel } from './enable-channel'

export async function channelsRoutes(server: FastifyInstance) {
  server.get('/', listChannels)
  server.post('/', createChannel)
  server.delete('/:channel_id', deleteChannel)
  server.post('/:channel_id/enable', enableChannel)
  server.post('/:channel_id/disable', disableChannel)
  server.patch('/:channel_id', editChannel)
  server.get('/theme/:theme', listChannelsByTheme)
}
