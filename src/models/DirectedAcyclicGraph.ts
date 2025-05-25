import {
  EdgeWithActionsModel,
  EdgeWithReadonlyActionsModel,
} from './EdgeWithActions';

import {
  NodeWithActionsModel,
  NodeWithReadonlyActionsModel,
} from './NodeWithActions';

/**
 * A collection consisting of all supported graph size values.
 */
export type DirectedAsyclicGraphSize = {
  /**
   * Contains count of nodes.
   */
  nodes: number;

  /**
   * Contains count of edges.
   */
  edges: number;

  /**
   * Contains depth of the DAG.
   */
  depth: number;

  /**
   * Contains width of the DAG.
   */
  width: number;
};

export type DirectedAcyclicGraphEdgeArgs<Node, Edge> = [unknown] extends [Edge]
  ? [tail: Node, head: Node, data?: Edge]
  : [tail: Node, head: Node, data: Edge];

export interface ReadonlyDirectedAcyclicGraph<Node, Edge = unknown>
  extends Iterable<Node> {
  /**
   * Topological order iterator.
   */
  [Symbol.iterator]: () => Iterator<Node>;

  /**
   * Contains structire sizes.
   */
  size: Readonly<DirectedAsyclicGraphSize>;

  /**
   * Contains all nodes of the DAG.
   */
  nodes: IterableIterator<Node>;

  /**
   * Contains all edges of the DAG.
   */
  edges: IterableIterator<DirectedAcyclicGraphEdgeArgs<Node, Edge>>;

  /**
   * Checks if the specified `node` is contained in the DAG.
   *
   * @param node - Node to be checked.
   *
   * @returns `true` if the `node` is contained in the graph, `false` otherwise.
   */
  has: (node: Node) => boolean;

  /**
   * Checks if the specified edge (`tail`, `head`) is contained in the DAG.
   *
   * @param tail - Tail node of the edge to be checked.
   * @param head - Head node of the edge to be checked.
   *
   * @returns `true` if the edge is contained in the graph, `false` otherwise.
   */
  hasEdge: (tail: Node, head: Node) => boolean;

  /**
   * Checks if there is a path starting at the `tail` and ending at the `head`.
   *
   * @param tail - Node to be tail of the searched path.
   * @param head - Node to be head of the searched path.
   * @param maxLength - Maximum possible distance between the `tail` and `head`.
   *
   * @returns `true` if the path exists, `false` otherwise.
   */
  hasPathBetween: (tail: Node, head: Node, maxLength: number) => boolean;

  /**
   * Searches ancestors of the `descendant` that are no deeper than `maxDepth`.
   *
   * @param descendant - Node whose ancestors are searched.
   * @param maxDepth - Maximum possible distance between the `descendant` and a found ancestors.
   *
   * @returns Ancecestors of the `descendant` node.
   */
  ancestorsOf: (descendant: Node, maxDepth: number) => ReadonlySet<Node>;

  /**
   * Searches descendants of the `ancestor` that are no deeper than `maxDepth`.
   *
   * @param ancestor - Node whose descendants are searched.
   * @param maxDepth - Maximum possible distance between the `ancestor` and a found descendants.
   *
   * @returns Descendants of the `ancestor` node.
   */
  descendantsOf: (ancestor: Node, maxDepth: number) => ReadonlySet<Node>;

  /**
   * Searches the parents of the `child`.
   *
   * @param child - Node whose parents are seached.
   *
   * @returns Parents of the `child` node.
   */
  parentsOf: (child: Node) => ReadonlySet<Node>;

  /**
   * Searches the children of the `parent`.
   *
   * @param parent - Node whose children are searched.
   *
   * @returns Children of the `parent` node.
   */
  childrenOf: (parent: Node) => ReadonlySet<Node>;

  /**
   * Attaches shortcuts of DAG's actions for specified node.
   *
   * @param node - Node for which actions are attached.
   *
   * @returns Node with attached readonly actions.
   */
  node: (node: Node) => NodeWithReadonlyActionsModel<Node, Edge>;

  /**
   * Attaches shortcuts of DAG's actions for specified node.
   *
   * @param tail - Tail of edge.
   * @param head - Head of edge.
   *
   * @returns Edge with attached readonly actions.
   */
  edge: (
    tail: Node,
    head: Node,
  ) => EdgeWithReadonlyActionsModel<Node, Edge> | undefined;

  /**
   * Creates a new DAG with reversed edges.
   *
   * @returns Readonly reverse of the DAG.
   */
  reversed: () => ReadonlyDirectedAcyclicGraph<Node, Edge>;

  /**
   * Sorts nodes in topological order and returns result.
   *
   * @returns Nodes sorted in topological order.
   */
  sorted: () => Node[];
}

/**
 * Describes the general behavior of directed acyclic graph (DAG).
 *
 * @typeParam Node - Type of the contained nodes.
 */
export interface AbstractDirectedAcyclicGraph<Node, Edge = unknown>
  extends ReadonlyDirectedAcyclicGraph<Node, Edge> {
  /**
   * Deletes all nodes and edges.
   */
  clear: () => void;

  /**
   * Adds the specified `node` to the DAG if it is not contained.
   *
   * @param node - Node to be added.
   *
   * @returns `true` if the `node` *did not* contain in the DAG, `false` otherwise.
   */
  add: (node: Node) => boolean;

  /**
   * Deletes the specified `node` and all edges connected with it.
   *
   * @param node - Node to be deleted.
   *
   * @returns `true` if the `node` contained in the DAG, `false` otherwise.
   */
  delete: (node: Node) => boolean;

  /**
   * Creates specified edge (`tail`, `head`).
   *
   * @param tail - Node to be tail of new edge.
   * @param head - Node to be head of new edge.
   * @param edge - Data to be associated with new edge.
   *
   * @returns `true` if the edge *did not* contain in the DAG, `false` otherwise.
   */
  connect(...args: DirectedAcyclicGraphEdgeArgs<Node, Edge>): boolean;

  /**
   * Deletes specified edge (`tail`, `head`).
   *
   * @param tail - Node to be tail of removed edge.
   * @param head - Node to be head of removed edge.
   *
   * @returns `true` if the edge contained in the DAG, `false` otherwise.
   */
  disconnect: (tail: Node, head: Node) => boolean;

  /**
   * Creates a new DAG with reversed edges.
   *
   * @returns Readonly reverse of the DAG.
   */
  reversed: () => AbstractDirectedAcyclicGraph<Node, Edge>;

  /**
   * Attaches shortcuts of DAG's actions for specified node.
   *
   * @param node - Node for which actions are attached.
   *
   * @returns Node with attached actions.
   */
  node: (node: Node) => NodeWithActionsModel<Node, Edge>;

  /**
   * Attaches shortcuts of DAG's actions for specified node.
   *
   * @param tail - Tail of edge.
   * @param head - Head of edge.
   *
   * @returns Edge with attached actions.
   */
  edge: (
    tail: Node,
    head: Node,
  ) => EdgeWithActionsModel<Node, Edge> | undefined;
}
