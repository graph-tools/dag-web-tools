export class InvalidSubPartitioningError extends Error {
  constructor() {
    super('Each node must be contained in subpart of its parent part.');
  }
}
