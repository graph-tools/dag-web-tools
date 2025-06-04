export class NonIsomorphicPartitionsError extends Error {
  constructor() {
    super('Partitions are not isomorphic.');
  }
}
