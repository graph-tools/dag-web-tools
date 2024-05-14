import { NodeWithActionsModel } from './node';

/**
 * Contains strategies for injection code at iteration time.
 */
export const enum IteratorInjectOn {
  /**
   * Iterator will provide control when entering the node.
   */
  ENTER = 'enter',
  /**
   * Iterator will provide control when leaving the node.
   */
  LEAVE = 'leave',
  /**
   * Iterator will provide control both when entering and leaving the node.
   */
  ALL = 'all',
}

export type BreadthIteratorOptions<Node> = {
  /**
   * Defines depth of the iteration tree.
   */
  depth: number;

  /**
   * Defines nodes that will be ignored during iteration.
   */
  ignore: ReadonlySet<Node>;
};

export type BreadthIteratorDetails = {
  /**
   * Contains depth of the node.
   */
  depth: number;
};

export type BreadthIteratorItem<Node> = [Node, BreadthIteratorDetails];

export type DepthIteratorOptions<Node> = {
  /**
   * Defines depth of the iteration tree.
   */
  depth: number;

  /**
   * Defines when the iterator should provide control.
   */
  injectOn: IteratorInjectOn;

  /**
   * Defines nodes that will be ignored during iteration.
   */
  ignore: ReadonlySet<Node>;
};

export type DepthIteratorDetails = {
  /**
   * Contains depth of the node.
   */
  depth: number;

  /**
   * Contains injection time.
   */
  injectOn: IteratorInjectOn;
};

export type DepthIteratorItem<Node> = [Node, DepthIteratorDetails];

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

export interface DirectedAcyclicGraphIterators<Node> {
  /**
   * Generator of depth first iterator.
   *
   * @param root - Node to be root of iteration tree.
   * @param options - Values specifying the iterator behavior.
   *
   * @returns Depth first iterator with specified behavior.
   */
  depth: (
    root: Node,
    options: DepthIteratorOptions<Node>,
  ) => Iterator<DepthIteratorItem<Node>, undefined>;

  /**
   * Generator of breadth first iterator.
   *
   * @param root - Node to be root of iteration tree.
   * @param options - Values specifying the iterator behavior.
   *
   * @returns Breadth first iterator with specified behavior.
   */
  breadth: (
    root: Node,
    options: BreadthIteratorOptions<Node>,
  ) => Iterator<BreadthIteratorItem<Node>, undefined>;
}

/**
 * Describes the general behavior of directed acyclic graph (DAG).
 *
 * @typeParam Node - Type of the contained nodes.
 */
export interface DirectedAcyclicGraph<Node> extends Iterable<Node> {
  /**
   * Contains structire sizes.
   */
  size: Readonly<DirectedAsyclicGraphSize>;

  /**
   * Contains structure iterators.
   */
  iterator: Readonly<DirectedAcyclicGraphIterators<Node>>;

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
   *
   * @returns `true` if the edge *did not* contain in the DAG, `false` otherwise.
   */
  connect: (tail: Node, heads: Node) => boolean;

  /**
   * Deletes specified edge (`tail`, `head`).
   *
   * @param tail - Node to be tail of removed edge.
    @param head - Node to be head of removed edge.
   *
   * @returns `true` if the edge contained in the DAG, `false` otherwise.
   */
  disconnect: (tail: Node, head: Node) => boolean;

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
   * @returns Node with attached actions.
   */
  node: (node: Node) => NodeWithActionsModel<Node> | undefined;

  /**
   * Creates a new DAG with reversed edges.
   *
   * @returns Reverse of the DAG.
   */
  reversed: () => DirectedAcyclicGraph<Node>;

  /**
   * Sorts nodes in topological order and returns result.
   *
   * @returns Nodes sorted in topological order.
   */
  sorted: () => Node[];
}
