import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createPage, deletePage, editPage, listPages } from './'
import { createPageDocs, listPagesDocs } from './docs'

export async function pagesRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/:channel_id/pages', listPagesDocs, listPages)
  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/:channel_id/pages', createPageDocs, createPage)
  server.delete('/:channel_id/pages/:page_id', deletePage)
  server.patch('/:channel_id/pages/:page_id', editPage)
}
