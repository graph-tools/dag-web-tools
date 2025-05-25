export type ConnectToArgs<Node, Edge> = [unknown] extends [Edge]
  ? [head: Node, data?: Edge]
  : [head: Node, data: Edge];

export type ConnectFromArgs<Node, Edge> = [unknown] extends [Edge]
  ? [tail: Node, data?: Edge]
  : [tail: Node, data: Edge];

/**
 * Describes the general behavior of nodes with attached *readonly* actions.
 *
 * @typeParam Node - Type of the contained node.
 */
export interface NodeWithReadonlyActionsModel<Node, Edge = unknown> {
  /**
   * Contains node.
   */
  readonly node: Node;

  /**
   * Contains parents of the node.
   */
  readonly parents: ReadonlySet<NodeWithReadonlyActionsModel<Node, Edge>>;

  /**
   * Contains children of the node.
   */
  readonly children: ReadonlySet<NodeWithReadonlyActionsModel<Node, Edge>>;

  /**
   * Searches ancestors of the node that are no deeper than `maxDepth`.
   *
   * @param maxDepth - Maximum possible distance between the node and a found ancestors.
   *
   * @returns Ancecestors of the node.
   */
  ancestors: (
    maxDepth: number,
  ) => ReadonlySet<NodeWithReadonlyActionsModel<Node, Edge>>;

  /**
   * Searches descendants of the node that are no deeper than `maxDepth`.
   *
   * @param maxDepth - Maximum possible distance between the node and a found descendants.
   *
   * @returns Descendants of the node.
   */
  descendants: (
    maxDepth: number,
  ) => ReadonlySet<NodeWithReadonlyActionsModel<Node, Edge>>;

  /**
   * Checks if the node is the child of `parent`.
   *
   * @param parent - Node to be checked as parent.
   *
   * @returns `true` if the node is the child of the `parent`, `false` otherwise.
   */
  isChildOf: (parent: Node) => boolean;

  /**
   * Checks if the node is the parent of `child`.
   *
   * @param child - Node to be checked as child.
   *
   * @returns `true` if the node is the parent of the `child`, `false` otherwise.
   */
  isParentOf: (child: Node) => boolean;

  /**
   * Checks if the node is the ancestor of the `descendant` no deeper than `maxDepth`.
   *
   * @param descendant - Node to be checked as descendant of the node.
   * @param maxDepth - Maximum distance for search the path between the node and the `descendant`.
   *
   * @returns `true` if the node is the anscestor of the `descendant`, `false` otherwise
   */
  isAncestorOf: (descendant: Node, maxDepth: number) => boolean;

  /**
   * Checks if the node is the descendant of the `ancestor` no deeper than `maxDepth`.
   *
   * @param ancestor - Node to be checked as ancestor of the node.
   * @param maxDepth - Maximum distance for search the path between the `ancestor` and the node.
   *
   * @returns `true` if the node is the descendant of the `ancestor`, `false` otherwise
   */
  isDescendantOf: (ancestor: Node, maxDepth: number) => boolean;
}

/**
 * Describes the general behavior of nodes with attached actions.
 *
 * @typeParam Node - Type of the contained node.
 */
export interface NodeWithActionsModel<Node, Edge = unknown>
  extends NodeWithReadonlyActionsModel<Node, Edge> {
  /**
   * @inheritdoc
   */
  readonly parents: ReadonlySet<NodeWithActionsModel<Node, Edge>>;

  /**
   * @inheritdoc
   */
  readonly children: ReadonlySet<NodeWithActionsModel<Node, Edge>>;

  /**
   * @inheritdoc
   */
  ancestors: (
    maxDepth: number,
  ) => ReadonlySet<NodeWithActionsModel<Node, Edge>>;

  /**
   * @inheritdoc
   */
  descendants: (
    maxDepth: number,
  ) => ReadonlySet<NodeWithActionsModel<Node, Edge>>;

  /**
   * Creates specified edge (`node`, `head`).
   *
   * @param head - Node to be head of new edge.
   *
   * @returns `true` if the edge *did not* contain in the DAG, `false` otherwise.
   */
  connectTo: (...[head, data]: ConnectToArgs<Node, Edge>) => boolean;

  /**
   * Creates specified edge (`node`, `head`).
   *
   * @param tail - Node to be tail of new edge.
   *
   * @returns `true` if the edge *did not* contain in the DAG, `false` otherwise.
   */
  connectFrom: (...[tail, data]: ConnectFromArgs<Node, Edge>) => boolean;

  /**
   * Deletes specified edge (`node`, `head`).
   *
   * @param head - Node to be head of removed edge.
   *
   * @returns `true` if the edge contained in the DAG, `false` otherwise.
   */
  disconnectTo: (head: Node) => boolean;

  /**
   * Deletes specified edge (`tail`, `node`).
   *
   * @param tail - Node to be tail of removed edge.
   *
   * @returns `true` if the edge contained in the DAG, `false` otherwise.
   */
  disconnectFrom: (tail: Node) => boolean;
}
