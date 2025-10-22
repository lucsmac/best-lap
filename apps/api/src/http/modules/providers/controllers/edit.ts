import { FastifyReply, FastifyRequest } from "fastify";
import { TypeormProvidersRepository } from "@best-lap/infra";
import { editProviderRequestBodySchema, editProviderRequestParamsSchema } from "../utils/edit-route-schemas";
import { EditProviderUseCase } from "@best-lap/core";

export async function editProvider(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { provider_id } = editProviderRequestParamsSchema.parse(request.params)
    const dataToUpdate = editProviderRequestBodySchema.parse(request.body)

    const providersRepository = new TypeormProvidersRepository()
    const editProviderUseCase = new EditProviderUseCase(providersRepository)

    await editProviderUseCase.execute(provider_id, dataToUpdate)

    return reply.code(204).send({ message: 'Provider updated successfully' })
  } catch (error) {
    console.error(error)

    return reply.code(500).send({ error: 'Internal Server Error.' })
  }
}
