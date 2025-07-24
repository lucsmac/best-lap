import { FastifyInstance } from 'fastify'
import { createPage } from './create'

export async function pagesRoutes(server: FastifyInstance) {
  server.post('/:channel_id/pages', createPage)
}
