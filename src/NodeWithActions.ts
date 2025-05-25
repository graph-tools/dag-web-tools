import {
  AbstractDirectedAcyclicGraph,
  ConnectFromArgs,
  ConnectToArgs,
  NodeWithActionsModel,
} from './models';
import { ProxyReadonlySet } from './utils';

export class NodeWithActions<Node, Edge = unknown>
  implements NodeWithActionsModel<Node, Edge>
{
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
    protected source: AbstractDirectedAcyclicGraph<Node, Edge>,
  ) {}

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `parentsOf(node)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.parentsOf|parentsOf interface} for more information.
   */
  public get parents(): ReadonlySet<NodeWithActionsModel<Node, Edge>> {
    return new ProxyReadonlySet<NodeWithActionsModel<Node, Edge>, Node>(
      this.source.parentsOf(this.node),
      (node) => this.source.node(node),
      (nodeWithAction) => nodeWithAction.node,
    );
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `childrenOf(node)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.childrenOf|childrenOf interface} for more information.
   */
  public get children(): ReadonlySet<NodeWithActionsModel<Node, Edge>> {
    return new ProxyReadonlySet<NodeWithActionsModel<Node, Edge>, Node>(
      this.source.childrenOf(this.node),
      (node) => this.source.node(node),
      (nodeWithAction) => nodeWithAction.node,
    );
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `ancestorsOf(node, maxDepth)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.ancestorsOf|ancestorsOf interface} for more information.
   */
  public ancestors(maxDepth: number = +Infinity) {
    return new ProxyReadonlySet<NodeWithActionsModel<Node, Edge>, Node>(
      this.source.ancestorsOf(this.node, maxDepth),
      (node) => this.source.node(node),
      (nodeWithAction) => nodeWithAction.node,
    );
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `descendantsOf(node, maxDepth)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.descendantsOf|descendantOf interface} for more information.
   */
  public descendants(maxDepth: number = +Infinity) {
    return new ProxyReadonlySet<NodeWithActionsModel<Node, Edge>, Node>(
      this.source.descendantsOf(this.node, maxDepth),
      (node) => this.source.node(node),
      (nodeWithAction) => nodeWithAction.node,
    );
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * To find the relationship, the `hasPathBetween(node, descendant, maxDepth)` of the source structure is used.
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
   *
   * @see {@link DirectedAcyclicGraph.hasPathBetween|hasPathBetween interface} for more information.
   */
  public isDescendantOf(ancestor: Node, maxDepth: number = +Infinity) {
    return this.source.hasPathBetween(this.node, ancestor, maxDepth);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `hasPathBetween(parent, node, 1)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.hasPathBetween|hasPathBetween interface} for more information.
   */
  public isChildOf(parent: Node) {
    return this.source.hasPathBetween(parent, this.node, 1);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `hasPathBetween(node, child, 1)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.hasPathBetween|hasPathBetween interface} for more information.
   */
  public isParentOf(child: Node) {
    return this.source.hasPathBetween(this.node, child, 1);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `connect(node, head)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.connect|connect interface} for more information.
   */
  public connectTo(...[head, data]: ConnectToArgs<Node, Edge>) {
    return this.source.connect(this.node, head, data!);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `connect(tail, node)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.connect|connect interface} for more information.
   */
  public connectFrom(...[tail, data]: ConnectFromArgs<Node, Edge>): boolean {
    return this.source.connect(tail, this.node, data!);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `disconnect(node, head)` on the source structure.
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
   *
   * @see {@link DirectedAcyclicGraph.disconnect|disconnect interface} for more information.
   */
  public disconnectFrom(tail: Node) {
    return this.source.disconnect(tail, this.node);
  }
}
