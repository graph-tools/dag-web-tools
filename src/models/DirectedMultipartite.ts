export interface AbstractDirectedMultipartite<Node>
  extends Iterable<[number, Set<Node>]> {
  /**
   * Deletes all parts.
   */
  clear: () => void;

  /**
   * Sets the `node` to the part with the specified `order`.
   *
   * @param node - Node to be set.
   * @param order - Order of the part.
   *
   * @returns `this` directed multipartite graph mask.
   */
  set: (node: Node, order: number) => AbstractDirectedMultipartite<Node>;

  /**
   * Deletes the specified `node`.
   *
   * @param node - Node to be deleted.
   *
   * @returns `true` if the `node` contained, `false` otherwise.
   */
  delete: (node: Node) => boolean;

  /**
   * Checks if the specified `order` is contained.
   *
   * @param order - Order to be checked.
   *
   * @returns `true` if the `order` is contained, `false` otherwise.
   */
  has: (order: number) => boolean;

  /**
   * Checks if the specified `node` is contained.
   *
   * @param node - Order to be checked.
   *
   * @returns `true` if the `node` is contained, `false` otherwise.
   */
  hasNode: (node: Node) => boolean;

  /**
   * Gets nodes from the part with the specified order.
   *
   * @param order - Part order.
   *
   * @returns Set of part nodes if order contained, `undefined` otherwise.
   */
  nodesOf: (order: number) => ReadonlySet<Node> | undefined;

  /**
   * Gets the order of the part that contains the specified node.
   *
   * @param node - Part node.
   *
   * @returns Order of the part if node contained, `undefined` otherwise.
   */
  orderOf: (node: Node) => number | undefined;

  /**
   *
   * @returns `true` if the numbers of the order have changed, `false` if no changes were required.
   */
  normalize: () => boolean;

  /**
   *
   * @returns new multipartite with the reverse order
   */
  revert: () => AbstractDirectedMultipartite<Node>;
}
