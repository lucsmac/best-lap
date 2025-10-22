import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  createProviderDocs,
  listProvidersDocs,
  deleteProviderDocs,
  editProviderDocs,
  showProviderDocs
} from './docs'
import {
  listProviders,
  createProvider,
  deleteProvider,
  editProvider,
  showProvider
} from './controllers'

export async function providersRoutes(server: FastifyInstance) {
  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/', listProvidersDocs, listProviders)

  server
    .withTypeProvider<ZodTypeProvider>()
    .get('/:provider_id', showProviderDocs, showProvider)

  server
    .withTypeProvider<ZodTypeProvider>()
    .post('/', createProviderDocs, createProvider)

  server
    .withTypeProvider<ZodTypeProvider>()
    .delete('/:provider_id', deleteProviderDocs, deleteProvider)

  server
    .withTypeProvider<ZodTypeProvider>()
    .patch('/:provider_id', editProviderDocs, editProvider)
}
