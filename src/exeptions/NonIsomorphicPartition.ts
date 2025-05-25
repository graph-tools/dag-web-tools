export class NonIsomorphicPartitionError extends Error {
  constructor() {
    super('Partition are not isomorphic.');
  }
}
