export class UnmatchedSubPartitionError extends Error {
  constructor() {
    super('Sub-partition must constain all and only nodes from parent.');
  }
}
