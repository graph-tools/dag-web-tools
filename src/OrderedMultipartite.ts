import { AbstractDirectedMultipartite } from '.';
import { ForceMap } from './utils';

export class OrderedMultipartite<Node>
  implements AbstractDirectedMultipartite<Node>
{
  /**
   * Contains node-to-order mapping.
   * @internal
   */
  private _order = new Map<Node, number>();

  /**
   * Contains order-to-nodes mapping.
   * @internal
   */
  private _nodes = new ForceMap<number, Set<Node>>(() => new Set<Node>());

  constructor() {}

  public *[Symbol.iterator]() {
    yield* this._nodes;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public clear() {
    this._order.clear;
    this._nodes.clear;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public set(node: Node, order: number) {
    this._order.set(node, order);
    this._nodes.forceGet(order).add(node);

    return this;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public delete(node: Node) {
    if (!this._order.has(node)) return false;

    this._nodes.get(this._order.get(node)!)!.delete(node);
    this._order.delete(node);

    return true;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public has(order: number) {
    return this._nodes.has(order);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public hasNode(node: Node) {
    return this._order.has(node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public orderOf(node: Node) {
    return this._order.get(node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public nodesOf(order: number) {
    return this._nodes.get(order);
  }
}
