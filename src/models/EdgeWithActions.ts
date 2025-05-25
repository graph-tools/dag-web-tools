import {
  NodeWithActionsModel,
  NodeWithReadonlyActionsModel,
} from './NodeWithActions';

/**
 * Describes the general behavior of edges with attached *readonly* actions.
 *
 * @typeParam Node - Type of the contained node.
 * @typeParam Edge - Type of the contained edge.
 */
export interface EdgeWithReadonlyActionsModel<Node, Edge> {
  /**
   * Contains edge data.
   */
  readonly data: Edge;

  /**
   * Contains tail of the node.
   */
  readonly tail: NodeWithReadonlyActionsModel<Node, Edge>;

  /**
   * Contains head of the node.
   */
  readonly head: NodeWithReadonlyActionsModel<Node, Edge>;
}

/**
 * Describes the general behavior of edges with attached actions.
 *
 * @typeParam Node - Type of the contained node.
 * @typeParam Node - Type of the contained edge.
 */
export interface EdgeWithActionsModel<Node, Edge>
  extends EdgeWithReadonlyActionsModel<Node, Edge> {
  /**
   * Contains tail of the node.
   */
  readonly tail: NodeWithActionsModel<Node, Edge>;

  /**
   * Contains head of the node.
   */
  readonly head: NodeWithActionsModel<Node, Edge>;

  /**
   * Deletes the edge.
   *
   * @returns `true` if the edge contained in the DAG, `false` otherwise.
   */
  delete: () => boolean;
}
