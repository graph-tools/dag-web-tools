import { ReadonlyDirectedAcyclicGraph } from '@self/dag';
import { DirectedAcyclicGraphActions, NodeWithData } from '@demo/hooks';

import * as T from './types';

export function getNode(
  instance: ReadonlyDirectedAcyclicGraph<NodeWithData<T.NodeData>>,
  predicate: (node: NodeWithData<T.NodeData>) => boolean,
) {
  for (const node of instance.nodes) {
    if (predicate(node)) return node;
  }
  return null;
}

export function getNodes(
  instance: ReadonlyDirectedAcyclicGraph<NodeWithData<T.NodeData>>,
  predicate: (node: NodeWithData<T.NodeData>) => boolean,
) {
  const nodes = [];
  for (const node of instance.nodes) {
    if (predicate(node)) nodes.push(node);
  }
  return nodes;
}

export function getRootNode(
  instance: ReadonlyDirectedAcyclicGraph<NodeWithData<T.NodeData>>,
) {
  return getNode(instance, (node) => node.data.data.root === true);
}

export function getIgnored(
  instance: ReadonlyDirectedAcyclicGraph<NodeWithData<T.NodeData>>,
) {
  return getNodes(instance, (node) => node.data.data.ignored === true);
}

export function groupNodes(
  nodes: Iterable<string>,
  group: string,
  dag: DirectedAcyclicGraphActions<T.NodeData>,
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
  dag: DirectedAcyclicGraphActions<T.NodeData>,
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
