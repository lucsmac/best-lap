import { ProviderEntity } from "@best-lap/core";
import { TypeormProvidersRepository } from "@best-lap/infra";
import { FastifyReply, FastifyRequest } from "fastify";
import { showProviderRequestParamsSchema } from "../utils/show-provider-route-schema";

export async function showProvider(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { provider_id } = showProviderRequestParamsSchema.parse(request.params)

    const providersRepository = new TypeormProvidersRepository()
    const provider: ProviderEntity = await providersRepository.findById(provider_id) as ProviderEntity

    if (!provider) {
      return reply.code(404).send({ error: "Provider not found" })
    }

    return reply.code(200).send({ provider })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
