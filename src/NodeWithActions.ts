import { DirectedAcyclicGraph } from '.';
import { NodeWithActionsModel } from './models';
import { ProxyReadonlySet } from './utils';

export class NodeWithActions<Node> implements NodeWithActionsModel<Node> {
  constructor(
    /**
     * @inheritdoc
     */
    public readonly node: Node,

    /**
     * Contains parent structure.
     *
     * @internal
     */
    protected source: DirectedAcyclicGraph<Node>,
  ) {}

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `parentsOf(node)` on the source structure.
   * {@inheritDoc DirectedAcyclicGraph.parentsOf}
   *
   * @see {@link DirectedAcyclicGraph.parentsOf|parentsOf interface} for more information.
   */
  public get parents(): ReadonlySet<this> {
    return new ProxyReadonlySet<this, Node>(
      this.source.parentsOf(this.node),
      (node) => this.source.node(node) as this,
      (nodeWithAction) => nodeWithAction.node,
    );
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
  public get children(): ReadonlySet<this> {
    return new ProxyReadonlySet<this, Node>(
      this.source.childrenOf(this.node),
      (node) => this.source.node(node) as this,
      (nodeWithAction) => nodeWithAction.node,
    );
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
  public ancestors(maxDepth: number = +Infinity): ReadonlySet<this> {
    return new ProxyReadonlySet<this, Node>(
      this.source.ancestorsOf(this.node, maxDepth),
      (node) => this.source.node(node) as this,
      (nodeWithAction) => nodeWithAction.node,
    );
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
  public descendants(maxDepth: number = +Infinity): ReadonlySet<this> {
    return new ProxyReadonlySet<this, Node>(
      this.source.descendantsOf(this.node, maxDepth),
      (node) => this.source.node(node) as this,
      (nodeWithAction) => nodeWithAction.node,
    );
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
    return this.source.hasPathBetween(this.node, descendant, maxDepth);
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
    return this.source.hasPathBetween(this.node, ancestor, maxDepth);
  }

  public isChildOf(node: Node) {
    return this.source.hasPathBetween(this.node, node, 1);
  }

  public isParentOf(node: Node) {
    return this.source.hasPathBetween(node, this.node, 1);
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
    return this.source.connect(this.node, head);
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
    return this.source.connect(tail, this.node);
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
    return this.source.disconnect(this.node, head);
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
    return this.source.disconnect(tail, this.node);
  }
}
