export class ChannelAlreadyExists extends Error {
  constructor() {
    super('Channel with this link already exists.')
  }
}
