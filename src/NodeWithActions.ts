import {
  AbstractDirectedAcyclicGraph,
  ReadonlyDirectedAcyclicGraph,
} from './models';
import { NodeWithActionsModel } from './models';

export class NodeWithReadonlyActions<Node>
  implements NodeWithReadonlyActions<Node>
{
  /**
   * Contains node.
   *
   * @internal
   */
  _node: Node;

  /**
   * Contains parent structure.
   *
   * @internal
   */
  _source: ReadonlyDirectedAcyclicGraph<Node>;

  constructor(node: Node, source: ReadonlyDirectedAcyclicGraph<Node>) {
    this._node = node;
    this._source = source;
  }

  public get node() {
    return this._node;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `parentsOf(node)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.parentsOf}
   *
   * @see {@link DirectedAcyclicGraph.parentsOf|parentsOf interface} for more information.
   */
  public get parents() {
    return this._source.parentsOf(this._node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `childrenOf(node)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.childrenOf}
   *
   * @see {@link DirectedAcyclicGraph.childrenOf|childrenOf interface} for more information.
   */
  public get children() {
    return this._source.childrenOf(this._node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `ancestorsOf(node, maxDepth)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.ancestorsOf}
   *
   * @see {@link DirectedAcyclicGraph.ancestorsOf|ancestorsOf interface} for more information.
   */
  public ancestors(maxDepth: number = +Infinity) {
    return this._source.ancestorsOf(this._node, maxDepth);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `descendantsOf(node, maxDepth)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.descendantsOf}
   *
   * @see {@link DirectedAcyclicGraph.descendantsOf|descendantOf interface} for more information.
   */
  public descendants(maxDepth: number = +Infinity) {
    return this._source.descendantsOf(this._node, maxDepth);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * To find the relationship, the `hasPathBetween(node, descendant, maxDepth)` of the source structure is used.
   * {@inheritDoc DirectedAcyclicGraph.hasPathBetween}
   *
   * @see {@link DirectedAcyclicGraph.hasPathBetween|hasPathBetween interface} for more information.
   */
  public isAncestorOf(descendant: Node, maxDepth: number = +Infinity) {
    return this._source.hasPathBetween(this._node, descendant, maxDepth);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * To find the relationship, the `hasPathBetween(ancestor, node, maxDepth)` of the source structure is used.
   * {@inheritDoc DirectedAcyclicGraph.hasPathBetween}
   *
   * @see {@link DirectedAcyclicGraph.hasPathBetween|hasPathBetween interface} for more information.
   */
  public isDescendantOf(ancestor: Node, maxDepth: number = +Infinity) {
    return this._source.hasPathBetween(this._node, ancestor, maxDepth);
  }

  public isChildOf(node: Node) {
    return this.parents.has(node);
  }

  public isParentOf(node: Node) {
    return this.children.has(node);
  }
}

export class NodeWithActions<Node>
  extends NodeWithReadonlyActions<Node>
  implements NodeWithActionsModel<Node>
{
  /**
   * Contains parent structure.
   *
   * @internal
   */
  declare _source: AbstractDirectedAcyclicGraph<Node>;

  constructor(node: Node, source: AbstractDirectedAcyclicGraph<Node>) {
    super(node, source);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `connect(node, head)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.connect}
   *
   * @see {@link DirectedAcyclicGraph.connect|connect interface} for more information.
   */
  public connectTo(head: Node) {
    return this._source.connect(this._node, head);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `connect(tail, node)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.connect}
   *
   * @see {@link DirectedAcyclicGraph.connect|connect interface} for more information.
   */
  public connectFrom(tail: Node) {
    return this._source.connect(tail, this._node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `disconnect(node, head)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.disconnect}
   *
   * @see {@link DirectedAcyclicGraph.disconnect|disconnect interface} for more information.
   */
  public disconnectTo(head: Node) {
    return this._source.disconnect(this._node, head);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `disconnect(tail, node)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.disconnect}
   *
   * @see {@link DirectedAcyclicGraph.disconnect|disconnect interface} for more information.
   */
  public disconnectFrom(tail: Node) {
    return this._source.disconnect(tail, this._node);
  }
}

export default NodeWithActions;
