import { ReadonlyDirectedAcyclicGraph } from '../models';
import { Partition } from '../Partition';

export function getSingletonPartition<Node, Edge>(
  graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
): Partition<Node> {
  const singleton = [];
  for (const node of graph.nodes) singleton.push([node]);
  return new Partition(singleton);
}
