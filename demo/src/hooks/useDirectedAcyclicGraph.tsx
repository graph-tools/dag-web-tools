import {
  DirectedAcyclicGraph,
  EdgeAdditionStrategy,
  ReadonlyDirectedAcyclicGraph,
} from '@self/dag';
import { useRef, useState } from 'react';

export type Identified<Data> = { id: string; data: Data };

export type Setter<T> = (prev: T) => T;

export interface DirectedAcyclicGraphActions<NodeData, EdgeData> {
  has: (id: string) => boolean;
  data: (id: string) => Readonly<NodeData> | undefined;
  node: (id: string) => Identified<NodeData> | undefined;
  edge: (id: string) => Identified<EdgeData> | undefined;
  clear: () => void;
  add: (data: NodeData) => string;
  delete: (id: string) => void;
  replace: (id: string, next: NodeData | Setter<NodeData>) => void;
  replaceEdge: (id: string, next: EdgeData | Setter<EdgeData>) => void;
  connect: (tailId: string, headId: string, edge: EdgeData) => void;
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

export function useDAG<NodeData, EdgeData>(
  initialValue?: ReadonlyDirectedAcyclicGraph<
    Identified<NodeData>,
    Identified<EdgeData>
  >,
) {
  const nodes = useRef(new Map<string, Identified<NodeData>>());
  const edges = useRef(new Map<string, Identified<EdgeData>>());

  const dag = useRef(
    DirectedAcyclicGraph.from(
      initialValue ??
        new DirectedAcyclicGraph<Identified<NodeData>, Identified<EdgeData>>(),
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
  const actions = useRef<DirectedAcyclicGraphActions<NodeData, EdgeData>>({
    has: (id) => nodes.current.has(id),

    node: (id) => nodes.current.get(id),

    edge: (id) => edges.current.get(id),

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
      let node;
      if (!(node = nodes.current.get(id))) return;

      if (typeof next === 'function') {
        node.data = (next as Setter<NodeData>)(node.data);
      } else {
        node.data = next;
      }
      update.current();
    },

    connect: (tailId, headId, data) => {
      const tail = nodes.current.get(tailId);
      const head = nodes.current.get(headId);
      const edge = { id: edgeId(tailId, headId), data };

      if (tail && head && dag.current.connect(tail, head, edge)) {
        edges.current.set(edge.id, edge);
        update.current();
      }
    },

    disconnect: (tailId, headId) => {
      const tail = nodes.current.get(tailId);
      const head = nodes.current.get(headId);

      if (tail && head) {
        const edge = dag.current.edge(tail, head)?.data;

        if (dag.current.disconnect(tail, head)) {
          edges.current.delete(edge!.id);
          update.current();
        }
      }
    },

    replaceEdge: (id, next) => {
      let edge;
      if (!(edge = edges.current.get(id))) return;

      if (typeof next === 'function') {
        edge.data = (next as Setter<EdgeData>)(edge.data);
      } else {
        edge.data = next;
      }
      update.current();
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
    instance as ReadonlyDirectedAcyclicGraph<
      Identified<NodeData>,
      Identified<EdgeData>
    >,
    actions.current,
  ] as const;
}
