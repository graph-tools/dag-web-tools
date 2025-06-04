import {
  NonIsomorphicPartitionsError,
  UnmatchedPartitionError,
} from '../../../exeptions';
import { ReadonlyPartition } from '../../../models';
import { ReadonlyWeightedDirectedAcyclicGraph } from '../../../utils/WeightedDirectedAcyclicGraph';

import {
  ConstantPottsData,
  ConstantPottsDataCollection,
  ReadonlyPartitionWithConstantPottsData,
} from './types';

export class PartitionWithConstantPottsData<Node>
  extends Array<Array<Node>>
  implements ReadonlyPartitionWithConstantPottsData<Node>
{
  constructor(
    partition: Iterable<Node[]> = [],
    public data: ConstantPottsDataCollection<Node | Iterable<Node>> = new Map(),
  ) {
    super(...partition);
  }
}

/**
 * Copies Constant Potts Model data from from the `base` partition
 * to the corresponding nodes and parts of the `dest` partition.
 *
 * @param base - Partition that is used as source of data.
 * @param dest - Partition for which data is copied.
 *
 * @returns Singleton root partition with Constant Potts Model data.
 *
 * Time Complexity (V8): O(n) where
 * * n - number of nodes in the `base` = number of nodes in the `dest`.
 */
export function copyData<Node>(
  base: ReadonlyPartitionWithConstantPottsData<Node>,
  dest: ReadonlyPartition<Node>,
): ConstantPottsDataCollection<Node> {
  const data: ConstantPottsDataCollection<Node> = new Map();

  let node: Node | null;
  let nodeData: ConstantPottsData | undefined;
  let partData: ConstantPottsData | undefined;

  for (const part of base) {
    node = null;

    for (node of part) {
      if (!(nodeData = base.data.get(node)))
        throw new NonIsomorphicPartitionsError();
      data.set(node, { ...nodeData });
    }

    if (node) {
      if (!(partData = base.data.get(part)))
        throw new NonIsomorphicPartitionsError();
      data.set(dest.get(node)!, { ...partData });
    }
  }

  return data;
}

/**
 * Creates root (without parent) singleton (new part for each node) partition for each node of the `graph`.
 * Also provides Constant Potts Model data for each node and part.
 *
 * @param graph - Weighted graph to be partitioned.
 *
 * @returns Singleton root partition with Constant Potts Model data.
 *
 * Time Complexity (V8): O(n) where
 * * n - number of nodes in the `graph`.
 */
export function getSingletonRootPartition<Node>(
  graph: ReadonlyWeightedDirectedAcyclicGraph<Node>,
): ReadonlyPartitionWithConstantPottsData<Node> {
  const partition = new PartitionWithConstantPottsData<Node>();

  for (const node of graph.nodes) {
    const part = [node];

    partition.push(part);

    partition.data.set(node, { size: 1, weight: 0 });
    partition.data.set(part, { size: 1, weight: graph.weightOf(node) });
  }

  return partition;
}

/**
 * Creates singleton (new part for each node) subpartition for each node of the `graph`.
 * Also provides Constant Potts Model data for each node and part.
 *
 * @param graph - Weighted graph to be partitioned.
 * @param parent - Parent partition to be based on.
 *
 * @returns Singleton subpartition with Constant Potts Model data.
 *
 * Time Complexity (V8): O(n) where
 * * n - number of nodes in the `graph`.
 */
export function getSingletonSubPartition<Node>(
  graph: ReadonlyWeightedDirectedAcyclicGraph<Node>,
  parent: ReadonlyPartitionWithConstantPottsData<Node>,
): ReadonlyPartitionWithConstantPottsData<Node> {
  const partition = new PartitionWithConstantPottsData<Node>();

  let nodeData: ConstantPottsData | undefined;
  for (const node of graph.nodes) {
    const part = [node];

    if (!(nodeData = parent.data.get(node)))
      throw new UnmatchedPartitionError();

    partition.push(part);

    partition.data.set(node, { size: nodeData.size, weight: 0 });
    partition.data.set(part, { size: nodeData.size, weight: nodeData.weight });
  }

  return partition;
}

/**
 * Creates global partition (single part with all and only nodes of the `partition`).
 * Also provides Constant Potts Model data for each node and part.
 *
 * @param partition - Partition to be wrapped by global partition.
 * @param graph - Weighted graph to be partitioned.
 *
 * @returns Global partition with Constant Potts Model data.
 *
 * Time Complexity (V8): O(n) where
 * * n - number of nodes in the `graph`.
 */
export function getGlobalParentPartition<Node>(
  partition: ReadonlyPartitionWithConstantPottsData<Node>,
  graph: ReadonlyWeightedDirectedAcyclicGraph<Node>,
): ReadonlyPartitionWithConstantPottsData<Node> {
  const part = [...graph.nodes];
  const parent = new PartitionWithConstantPottsData<Node>([part]);

  let totalSize = 0;
  let nodeData: ConstantPottsData | undefined;
  for (const node of graph.nodes) {
    if (!(nodeData = partition.data.get(node)))
      throw new UnmatchedPartitionError();

    parent.data.set(node, {
      size: nodeData.size,
      weight: graph.weightOf(node),
    });

    totalSize += nodeData.size;
  }

  parent.data.set(part, { size: totalSize, weight: 0 });

  return parent;
}
