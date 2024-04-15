export interface Shares<Order, Share, Node> {
  clear: () => void;

  new: (nodes?: Set<Node>, order?: number) => Readonly<Share>;
  delete: (share: Share) => boolean;
  has: (share: Share) => boolean;
  hasNode: (nodeId: Node) => boolean;
  getByNode: (nodeId: Node) => Readonly<Share> | undefined;

  nodesOf: (share: Share) => ReadonlySet<Node>;
  orderOf: (share: Share) => Order;

  addNodesTo: (share: Share, nodes: Node | Iterable<Node>) => void;
  deleteNodesFrom: (share: Share, nodes: Node | Iterable<Node>) => void;
  setOrderFor: (share: Share, order: Order) => void;
}
