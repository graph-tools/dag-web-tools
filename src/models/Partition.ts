export type PartitionSize = {
  /**
   * Contains number of nodes tracked by partition.
   */
  nodes: number;

  /**
   * Contains number of parts tracked by partition.
   */
  parts: number;
};

export interface ReadonlyPartition<Node> extends Iterable<ReadonlySet<Node>> {
  /**
   * Contains sizes of the partition.
   */
  readonly size: Readonly<PartitionSize>;

  /**
   * @returns Iterator of nodes contained in the partition.
   */
  nodes(): IterableIterator<Node>;

  /**
   * @returns Iterator of parts contained in the partition.
   */
  parts(): IterableIterator<ReadonlySet<Node>>;

  /**
   * Checks if the `item` (node or part) contains in the partititon.
   *
   * @param item - Node or part to be ckecked.
   *
   * @returns `true` if `item` contained in the partition, `false` otherwise.
   */
  has(item: Node | ReadonlySet<Node>): boolean;

  /**
   * Finds part of the `node` in the partition.
   *
   * @param node - Node for which the containing part to be found.
   *
   * @returns Containing part if `node` contained in the partition, `undefined` otherwise.
   */
  get(node: Node): ReadonlySet<Node> | undefined;
}

export interface AbstractPartition<Node> extends ReadonlyPartition<Node> {
  /**
   * Moves node of the partition to another part (or a new one) of the partition.
   *
   * @param node - Node to be moved.
   * @param part - Movement destination. If you want single out the `node` empty set must be passed.
   *
   * @returns `true` if the `node` moved, `false` otherwise.
   */
  move(node: Node, part: ReadonlySet<Node>): boolean;
}
