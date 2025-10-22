export class ProviderAlreadyExists extends Error {
  constructor() {
    super('Provider already exists.')
  }
}
