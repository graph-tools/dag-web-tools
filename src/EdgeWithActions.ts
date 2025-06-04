import {
  AbstractDirectedAcyclicGraph,
  DirectedAcyclicGraphEdgeArgs,
  EdgeWithActionsModel,
  NodeWithActionsModel,
} from './models';

export class EdgeWithActions<Node, Edge>
  implements EdgeWithActionsModel<Node, Edge>
{
  /**
   * @inheritdoc
   */
  public tail: NodeWithActionsModel<Node, Edge>;

  /**
   * @inheritdoc
   */
  public head: NodeWithActionsModel<Node, Edge>;

  /**
   * @inheritdoc
   */
  public data: Edge;

  constructor(
    [tail, head, data]: DirectedAcyclicGraphEdgeArgs<Node, Edge>,
    protected source: AbstractDirectedAcyclicGraph<Node, Edge>,
  ) {
    this.tail = this.source.node(tail);
    this.head = this.source.node(head);
    this.data = data!;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method is just a shortcut to call `disconnect(tail, head)` on the source structure.
   *
   * @see {@link DirectedAcyclicGraph.disconnect|disconnect interface} for more information.
   */
  public delete(): boolean {
    return this.source.disconnect(this.tail.node, this.head.node);
  }
}
