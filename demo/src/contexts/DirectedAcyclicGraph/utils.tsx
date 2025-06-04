import { ReadonlyDirectedAcyclicGraph } from '@self/dag';
import { DirectedAcyclicGraphActions, Identified } from '@demo/hooks';

import * as T from './types';

type Instance = ReadonlyDirectedAcyclicGraph<
  Identified<T.NodeData>,
  Identified<T.EdgeData>
>;

export function getNode(
  instance: Instance,
  predicate: (node: Identified<T.NodeData>) => boolean,
) {
  for (const node of instance.nodes) {
    if (predicate(node)) return node;
  }
  return null;
}

export function getNodes(
  instance: Instance,
  predicate: (node: Identified<T.NodeData>) => boolean,
) {
  const nodes = [];
  for (const node of instance.nodes) {
    if (predicate(node)) nodes.push(node);
  }
  return nodes;
}

export function getRootNode(instance: Instance) {
  return getNode(instance, (node) => node.data.data.root === true);
}

export function getIgnored(instance: Instance) {
  return getNodes(instance, (node) => node.data.data.ignored === true);
}

export function groupNodes(
  nodes: Iterable<string>,
  group: string,
  dag: DirectedAcyclicGraphActions<T.NodeData, T.EdgeData>,
) {
  dag.batch(() => {
    for (const node of nodes) {
      dag.replace(node, (data) => ({
        ...data,
        data: { ...data.data, group },
      }));
    }
  });
}

export function ungroupNodes(
  nodes: Iterable<string>,
  dag: DirectedAcyclicGraphActions<T.NodeData, T.EdgeData>,
) {
  dag.batch(() => {
    for (const node of nodes) {
      dag.replace(node, (data) => ({
        ...data,
        data: { ...data.data, group: undefined },
      }));
    }
  });
}
