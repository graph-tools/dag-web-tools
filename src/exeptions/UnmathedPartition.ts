export class UnmatchedPartitionError extends Error {
  constructor() {
    super('Partition must constain all and only nodes from graph.');
  }
}
