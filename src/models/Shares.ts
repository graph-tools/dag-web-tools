export interface AbstractShares<Share, Node> {
  clear: () => void;

  new: (nodes: Iterable<Node>, order: number) => Readonly<Share>;
  delete: (share: Share) => boolean;
  has: (share: Share) => boolean;
  hasNode: (nodeId: Node) => boolean;
  getByNode: (nodeId: Node) => Readonly<Share> | undefined;

  nodesOf: (share: Share) => ReadonlySet<Node>;
  orderOf: (share: Share) => number;

  addNodesTo: (share: Share, nodes: Node | Iterable<Node>) => void;
  deleteNodesFrom: (share: Share, nodes: Node | Iterable<Node>) => void;
  setOrderFor: (share: Share, order: number) => void;
}
