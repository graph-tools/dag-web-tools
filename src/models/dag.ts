export const enum IteratorDirection {
  DEFAULT = 'default',
  REVERSE = 'reverse',
}

export type IteratorOptions = {
  direction: IteratorDirection;
  depth: number;
};

export type NodeIterator<Node, Value> = (
  startFrom: Node,
  options: IteratorOptions,
) => Iterator<Value>;

export interface DAGSizes {
  nodes: number;
  edges: number;
  depth: number;
  breadth: number;
}

export interface DAG<T, Node> {
  sizes: Readonly<DAGSizes>;
  iterator: {
    depth: NodeIterator<Node, [Node, number]>;
    breadth: NodeIterator<Node, [Node, number]>;
  };

  clear: () => void;

  add: (data: T) => Node;
  delete: (node: Node) => boolean;
  has: (node: Node) => boolean;
  get: (node: Node) => T | undefined;

  connect: (from: Node | Iterable<Node>, to: Node | Iterable<Node>) => void;
  disconnect: (from: Node | Iterable<Node>, to: Node | Iterable<Node>) => void;

  parentsOf: (node: Node, depth: number) => ReadonlySet<Node>;
  childrenOf: (node: Node, depth: number) => ReadonlySet<Node>;

  isParent: (parent: Node, child: Node, depth: number) => boolean;
  isChild: (child: Node, parent: Node, depth: number) => boolean;

  deepParentsOf: (node: Node) => ReadonlySet<Node>;
  deepChildrenOf: (node: Node) => ReadonlySet<Node>;
  isDeepParent: (parent: Node, child: Node) => boolean;
  isDeepChild: (child: Node, parent: Node) => boolean;

  sort: () => Readonly<Node[]>;
}
