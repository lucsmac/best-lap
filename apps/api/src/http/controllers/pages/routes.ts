import { FastifyInstance } from 'fastify'
import { createPage } from './create'
import { deletePage } from './delete'
import { editPage } from './edit'
import { listPages } from './list'

export async function pagesRoutes(server: FastifyInstance) {
  server.get('/:channel_id/pages', listPages)
  server.post('/:channel_id/pages', createPage)
  server.delete('/:channel_id/pages/:page_id', deletePage)
  server.patch('/:channel_id/pages/:page_id', editPage)
}
