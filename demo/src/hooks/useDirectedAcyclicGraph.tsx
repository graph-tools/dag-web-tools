import {
  DirectedAcyclicGraph,
  EdgeAdditionStrategy,
  ReadonlyDirectedAcyclicGraph,
} from 'dag-web-tools';
import { useRef, useState } from 'react';

export type NodeWithData<Data> = { id: string; data: Data };
export interface DirectedAcyclicGraphActions<Data> {
  has: (id: string) => boolean;
  data: (id: string) => Readonly<Data> | undefined;
  node: (id: string) => NodeWithData<Data> | undefined;
  clear: () => void;
  add: (data: Data) => string;
  delete: (id: string) => void;
  replace: (id: string, next: Data | ((prev: Data) => Data)) => void;
  connect: (tailId: string, headId: string) => void;
  disconnect: (tailId: string, headId: string) => void;
  batch: (frame: () => void) => void;
}

let id = 0;
function nodeId() {
  return (id++).toString();
}

export function edgeId(tail: string, head: string) {
  return `${tail}-${head}`;
}

export function parseEdgeId(id: string) {
  return id.split('-') as [string, string];
}

export function useDAG<Data>(
  initialValue?: ReadonlyDirectedAcyclicGraph<NodeWithData<Data>>,
) {
  const nodes = useRef(new Map<string, NodeWithData<Data>>());
  const dag = useRef(
    DirectedAcyclicGraph.from(
      initialValue ?? new DirectedAcyclicGraph<NodeWithData<Data>>(),
      { edgeAdditionStrategy: EdgeAdditionStrategy.SAFE },
    ),
  );
  if (nodes.current.size != dag.current.size.nodes) {
    for (const node of dag.current.nodes) {
      nodes.current.set(node.id, node);
    }
  }

  const [instance, setDAG] = useState(dag.current);

  const update = useRef(() => setDAG((dag) => dag.reversed().reversed()));
  const actions = useRef<DirectedAcyclicGraphActions<Data>>({
    has: (id) => nodes.current.has(id),
    node: (id) => nodes.current.get(id),
    data: (id) => nodes.current.get(id)?.data,
    clear: () => {
      dag.current.clear();
      update.current();
    },
    add: (data) => {
      const node = { id: nodeId(), data };
      dag.current.add(node) &&
        nodes.current.set(node.id, node) &&
        update.current();
      return node.id;
    },
    delete: (id) => {
      const node = nodes.current.get(id);
      node &&
        dag.current.delete(node) &&
        nodes.current.delete(node.id) &&
        update.current();
    },
    replace: (id, next) => {
      const node = nodes.current.get(id);
      if (node === undefined) return;

      if (typeof next === 'function') {
        node.data = (next as (prev: Readonly<Data>) => Data)(node.data);
      } else {
        node.data = next;
      }
      update.current();
    },
    connect: (tailId, headId) => {
      const [tail, head] = [
        nodes.current.get(tailId),
        nodes.current.get(headId),
      ];
      tail && head && dag.current.connect(tail, head) && update.current();
    },
    disconnect: (tailId, headId) => {
      const [tail, head] = [
        nodes.current.get(tailId),
        nodes.current.get(headId),
      ];
      tail && head && dag.current.disconnect(tail, head) && update.current();
    },
    batch: (frame) => {
      const prev = update.current;
      update.current = () => {};

      frame();

      update.current = prev;
      update.current();
    },
  });

  return [
    instance as ReadonlyDirectedAcyclicGraph<NodeWithData<Data>>,
    actions.current,
  ] as const;
}
