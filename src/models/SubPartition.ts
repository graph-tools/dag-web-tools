import { AbstractPartition, ReadonlyPartition } from './Partition';

export interface ReadonlySubPartition<Node> extends ReadonlyPartition<Node> {
  /**
   * Contains parent partition of the subpartition.
   */
  readonly parent: ReadonlyPartition<Node>;

  /**
   * Finds sub-parts of the `superpart` contained the the paretn partition.
   *
   * @param superpart - The part those sub-parts are to be returned
   *
   * @returns Set of sub-parts for the `superpart` if parent part has `superpart`, empty set otherwise.
   */
  subparts(superpart: ReadonlySet<Node>): ReadonlySet<ReadonlySet<Node>>;

  /**
   * Finds super-part of the node or part contained the the subpartition.
   *
   * @param item - One of two node or part those super-part is to be returned.
   *
   * @returns Super-part for the `item` if the subpartition has `item`, undefined otherwise.
   */
  superpart(item: Node | ReadonlySet<Node>): ReadonlySet<Node> | undefined;
}

export interface AbstractSubPartition<Node>
  extends ReadonlySubPartition<Node>,
    AbstractPartition<Node> {}
