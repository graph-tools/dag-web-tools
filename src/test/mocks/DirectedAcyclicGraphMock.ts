import { NodeWithActions } from '../..';
import {
  DirectedAsyclicGraphSize,
  ReadonlyDirectedAcyclicGraph,
} from '../../models/DirectedAcyclicGraph';

export type MockData<Node> = {
  nodes: Set<Node>;
  edges: Set<[Node, Node]>;
  ancestors: Map<Node, Set<Node>[]>;
  descendants: Map<Node, Set<Node>[]>;
  size: DirectedAsyclicGraphSize;
  sorted: Node[];
};

export class DirectedAcyclicGraphMock<Node>
  implements ReadonlyDirectedAcyclicGraph<Node>
{
  private _size: DirectedAsyclicGraphSize = {
    nodes: 0,
    edges: 0,
    depth: 0,
    width: 0,
  };
  private _nodes: Set<Node>;
  private _edges: Set<[Node, Node]>;
  private _ancestors: Map<Node, Set<Node>[]>;
  private _descendants: Map<Node, Set<Node>[]>;
  private _sorted: Node[];

  constructor(data: MockData<Node>) {
    this._size = data.size;
    this._nodes = data.nodes;
    this._edges = data.edges;
    this._ancestors = data.ancestors;
    this._descendants = data.descendants;
    this._sorted = data.sorted;
  }

  public *[Symbol.iterator]() {
    yield* this._sorted;
  }

  public get size() {
    return this._size;
  }

  public get nodes(): IterableIterator<Node> {
    return this._nodes.keys();
  }

  public get edges(): IterableIterator<[Node, Node]> {
    return this._edges.keys();
  }

  public has(node: Node) {
    return this._nodes.has(node);
  }

  public hasEdge(tail: Node, head: Node) {
    return Boolean(this._descendants.get(tail)?.[1]?.has(head));
  }

  public hasPathBetween(tail: Node, head: Node, maxLength: number) {
    if (tail === head) return true;
    const layer = Math.min(
      (this._descendants.get(tail)?.length ?? 0) - 1,
      Math.floor(maxLength),
    );
    return (this._descendants.get(tail)?.[layer] ?? new Set<Node>()).has(head);
  }

  public ancestorsOf(descendant: Node, maxDepth: number): ReadonlySet<Node> {
    const layer = Math.min(
      (this._ancestors.get(descendant)?.length ?? 0) - 1,
      Math.floor(maxDepth),
    );
    return this._ancestors.get(descendant)?.[layer] ?? new Set<Node>();
  }

  public descendantsOf(ancestor: Node, maxDepth: number): ReadonlySet<Node> {
    const layer = Math.min(
      (this._descendants.get(ancestor)?.length ?? 0) - 1,
      Math.floor(maxDepth),
    );
    return this._descendants.get(ancestor)?.[layer] ?? new Set<Node>();
  }

  public parentsOf(child: Node): ReadonlySet<Node> {
    return this._ancestors.get(child)?.[1] ?? new Set<Node>();
  }

  public childrenOf(parent: Node): ReadonlySet<Node> {
    return this._descendants.get(parent)?.[1] ?? new Set<Node>();
  }

  public node(node: Node): NodeWithActions<Node> {
    return new NodeWithActions(node, this);
  }

  public reversed() {
    return new DirectedAcyclicGraphMock<Node>({
      nodes: this._nodes,
      edges: this._edges,
      descendants: this._ancestors,
      ancestors: this._descendants,
      size: this._size,
      sorted: [...this._sorted].reverse(),
    });
  }

  public sorted() {
    return [...this._sorted];
  }

  public clear() {}

  public add() {
    return false;
  }

  public delete() {
    return false;
  }

  public connect() {
    return false;
  }

  public disconnect() {
    return false;
  }
}
