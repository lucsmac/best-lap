import { FastifyReply, FastifyRequest } from "fastify";
import { deleteProviderRequestParamsSchema } from "../utils/delete-route-schemas";
import { TypeormProvidersRepository } from "@best-lap/infra";

export async function deleteProvider(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { provider_id } = deleteProviderRequestParamsSchema.parse(request.params);

    const providersRepository = new TypeormProvidersRepository()
    const provider = await providersRepository.findById(provider_id)

    if (!provider) return reply.code(404).send({ error: "Provider doesn't exist" })

    await providersRepository.delete(provider_id)

    return reply.code(204).send({ message: "Provider deleted successfully." });
  } catch (error) {
    console.log(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
