import {
  DirectedAsyclicGraphSize,
  ReadonlyDirectedAcyclicGraph,
} from '../models';

import {
  DirectedAcyclicGraph,
  DirectedAcyclicGraphOptions,
} from '../DirectedAcyclicGraph';

import { ForceMap } from './ForceMap';

export interface WeightedDirectedAcyclicGraphSize
  extends DirectedAsyclicGraphSize {
  weight: number;
}

export interface ReadonlyWeightedDirectedAcyclicGraph<
  Node,
  Edge extends { readonly weight: number } = { readonly weight: number },
> extends ReadonlyDirectedAcyclicGraph<Node, Edge> {
  readonly size: WeightedDirectedAcyclicGraphSize;

  /**
   * Returns weight of the `node` which is equal to the sum of weights
   * of all edges connected to it.
   *
   * @param node - Node to be weighted.
   *
   * @returns Weight of the `node`.
   */
  weightOf(node: Node): number;

  /**
   * @param tail - Tail of the edge to be weighted.
   * @param head - Head of the edge to be weighted.
   *
   * @returns Weight of the edge.
   */
  weightOf(tail: Node, head: Node): number;
}

export class WeightedDirectedAcyclicGraph<
    Node,
    Edge extends { readonly weight: number } = { readonly weight: number },
  >
  extends DirectedAcyclicGraph<Node, Edge>
  implements ReadonlyWeightedDirectedAcyclicGraph<Node, Edge>
{
  protected _weights = new ForceMap<Node, { weight: number }>(() => ({
    weight: 0,
  }));

  protected _size = { nodes: 0, edges: 0, depth: -1, width: -1, weight: 0 };

  static weigh<Node, Edge>(
    graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
    edgeWeightSelector: (tail: Node, head: Node) => number,
    options?: DirectedAcyclicGraphOptions,
  ) {
    const weighted = new WeightedDirectedAcyclicGraph(options);

    for (const tail of graph) {
      for (const head of graph.childrenOf(tail)) {
        weighted.connect(tail, head, {
          weight: edgeWeightSelector(tail, head),
        });
      }
    }

    return weighted;
  }

  public readonly size = new Proxy(this._size, {
    get: (target, name) => {
      switch (name) {
        case 'nodes':
          return this._nodes.size;
        case 'edges':
          return target.edges;
        case 'depth':
          return (target.depth = this._depth());
        case 'width':
          return (target.width = this._width());
        case 'weight':
          return target.weight;
      }
    },
  });

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public weightOf(tail: Node, head?: Node): number {
    if (head === undefined) {
      if (!this.has(tail)) return 0;
      return this._weights.forceGet(tail).weight;
    } else {
      return this.edge(tail, head)?.data.weight ?? 0;
    }
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(n)` where
   * * n - number of neighbours of the `node`.
   */
  public delete(node: Node): boolean {
    const children = this.childrenOf(node);
    const parents = this.parentsOf(node);

    if (!super.delete(node)) return false;

    const weight = this._weights.forceGet(node).weight;

    this._weights.delete(node);

    for (const child of children) {
      this._weights.forceGet(child).weight -= weight;
    }
    for (const parent of parents) {
      this._weights.forceGet(parent).weight -= weight;
    }

    return true;
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public connect(tail: Node, head: Node, data: Edge): boolean {
    if (!super.connect(tail, head, data)) return false;

    this._weights.forceGet(tail).weight += data.weight;
    this._weights.forceGet(head).weight += data.weight;
    this._size.weight += data.weight!;

    return true;
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public disconnect(tail: Node, head: Node): boolean {
    const weight = this.edge(tail, head)?.data.weight;

    if (!super.disconnect(tail, head)) return false;

    this._weights.forceGet(tail).weight -= weight!;
    this._weights.forceGet(head).weight -= weight!;
    this._size.weight -= weight!;

    return true;
  }
}
