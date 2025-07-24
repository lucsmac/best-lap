export class PageAlreadyExists extends Error {
  constructor() {
    super('Page with this path already exists.')
  }
}
