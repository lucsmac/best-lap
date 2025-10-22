import { ProviderEntity } from "@best-lap/core";
import { TypeormProvidersRepository } from "@best-lap/infra";
import { FastifyReply } from "fastify";

export async function listProviders(_: unknown, reply: FastifyReply) {
  try {
    const providersRepository = new TypeormProvidersRepository()
    const providersList: ProviderEntity[] = await providersRepository.listAll() as ProviderEntity[]

    return reply.code(200).send({ providers_count: providersList.length, providers: providersList })
  } catch (error) {
    console.error(error);

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
