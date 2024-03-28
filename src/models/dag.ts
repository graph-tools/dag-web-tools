import { Node, NodeId } from './node';

export type ComponentId = string;

export interface DAG<T> {
  readonly nodesCount: number;
  readonly edgesCount: number;
  readonly depth: number;
  readonly breadth: number;

  clear: () => void;

  add: (value: T, parents: NodeId[], children: NodeId[]) => NodeId;
  delete: (node: NodeId | NodeId[]) => T | undefined;
  has: (node: NodeId) => boolean;
  get: (node: NodeId) => Readonly<Node<T>> | undefined;

  childrenOf: (nodes: NodeId | NodeId[]) => NodeId[];
  parentsOf: (nodes: NodeId | NodeId[]) => NodeId[];

  connect: (from: NodeId | NodeId[], to: NodeId | NodeId[]) => void;
  disconnect: (from: NodeId | NodeId[], to: NodeId | NodeId[]) => void;
  hasConnect: (from: NodeId, to: NodeId) => boolean;
}
