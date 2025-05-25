import { ReadonlyDirectedAcyclicGraph } from '../../models';
import { argmaxx, softmax, getSingletonPartition } from '../../utils';

import {
  AbstractLeidenPartition,
  AbstractLeidenSubPartition,
  ChooseData,
  EdgeWeightSelector,
  LeidenOptions,
  ReadonlyLeidenPartition,
} from './types';

import { ConstantPottsPartitioning } from './ConstantPotts';

/**
 * Chooses part based on _probablilistically_ optimization of quality function.
 * `Probablity(community C is choosen) ~ exp(diff(C) / T)`
 *
 * @param data - Data to determine the choice.
 *
 * @returns Chosen part.
 */
export function choose<Node>(
  { parts, diffs }: ChooseData<Node>,
  { smoothing }: { smoothing: number },
): ReadonlySet<Node> | undefined {
  const chosen = Math.random();

  let i = 0;
  let sum = 0;
  for (const probability of softmax(diffs, { smoothing })) {
    if (chosen <= (sum += probability)) return parts[i];
    i++;
  }

  return undefined;
}

/**
 * Refine step of Leiden algorithm.
 * Creates a new singleton subpartition and merges its communities with each other.
 * Optimizes quality function _probablilistically_.
 *
 * @param partition - Partition to be refined.
 *
 * @returns Refined partition base on the `partition`.
 *
 */
export function refined<Node>(
  partition: ReadonlyLeidenPartition<Node>,
  { smoothing }: { smoothing: number },
): AbstractLeidenSubPartition<Node> {
  const refined = partition.sub();

  let diff: number;
  let chosen: ReadonlySet<Node> | undefined;

  for (const node of refined.nodes()) {
    if (refined.get(node)!.size !== 1) continue;
    if (!partition.connected(node)) continue;

    const parts: ChooseData<Node> = { parts: [], diffs: [] };

    for (const dest of refined.subparts(refined.parent.get(node)!)) {
      if (!refined.connected(dest)) continue;

      if ((diff = refined.diff(node, dest)) > 0) {
        parts.parts.push(dest);
        parts.diffs.push(diff);
      }
    }

    if ((chosen = choose(parts, { smoothing }))) {
      refined.move(node, chosen);
    }
  }

  return refined;
}

export function* withEmpty<Node>(parts: Iterable<ReadonlySet<Node>>) {
  for (const part of parts) yield part;
  yield new Set<Node>();
}

/**
 * Move step of Leiden algorithm.
 * Moves nodes between the `partition` communities.
 * Optimizes quality function _greedily_.
 *
 * @param partition - Partition into communities of which the nodes is moved.
 *
 * @remarks
 * This function mutates the `partition`.
 */
export function move<Node>(partition: AbstractLeidenPartition<Node>): void {
  const queue = new Set(partition.graph.nodes);

  for (const node of queue) {
    queue.delete(node);

    const [prime, primeDiff] = argmaxx(
      (part) => partition.diff(node, part),
      withEmpty(partition.parts()),
    );

    if (primeDiff > 0) {
      partition.move(node, prime);
      for (const parent of partition.graph.parentsOf(node))
        if (partition.get(node) !== partition.get(parent)) queue.add(parent);
      for (const child of partition.graph.childrenOf(node))
        if (partition.get(node) !== partition.get(child)) queue.add(child);
    }
  }
}

export function leiden<Node, Edge>(
  graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
  edgeWeightSelector: EdgeWeightSelector<Node>,
  {
    partitioning = new ConstantPottsPartitioning({ resolution: 1 }),
    initialPartition = getSingletonPartition(graph),
    iterations = graph.size.nodes,
    smoothing = 1,
  }: Partial<LeidenOptions<Node, Edge>> = {},
): Iterable<Iterable<Node>> {
  let partition = partitioning.init(
    graph,
    initialPartition,
    edgeWeightSelector,
  );

  for (let _ = 0; _ < iterations; ++_) {
    move(partition);

    if (partition.size.parts === partition.graph.size.nodes) break;

    partition = refined(partition, { smoothing }).aggregated();
  }

  return partition.nodes();
}
