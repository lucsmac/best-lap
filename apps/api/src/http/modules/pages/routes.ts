import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createPage, deletePage, editPage, listPages } from './controllers'
import { createPageDocs, listPagesDocs, deletePageDocs, editPageDocs } from './docs'

export async function pagesRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/:channel_id/pages', listPagesDocs, listPages)

  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/:channel_id/pages', createPageDocs, createPage)

  server
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:channel_id/pages/:page_id', deletePageDocs, deletePage)

  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:channel_id/pages/:page_id', editPageDocs, editPage)
}
