import { FastifyReply, FastifyRequest } from "fastify";
import { ProviderAlreadyExists, CreateProviderUseCase } from '@best-lap/core'
import { createProviderBodySchema } from "../utils/create-route-schemas";
import { TypeormProvidersRepository } from "@best-lap/infra";

export async function createProvider(request: FastifyRequest, reply: FastifyReply) {
  try {
    const {
      name,
      website,
      slug,
      description
    } = createProviderBodySchema.parse(request.body)

    const providersRepository = new TypeormProvidersRepository()
    const createProviderUseCase = new CreateProviderUseCase(providersRepository)

    await createProviderUseCase.execute({ name, website, slug, description })

    return reply.code(201).send({ message: 'Provider created successfully.' })
  } catch (error) {
    console.error(error);

    if (error instanceof ProviderAlreadyExists) {
      return reply.status(409).send({ message: error.message })
    }

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
