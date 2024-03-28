export type NodeId = string;

export type Node<T> = {
  id: string;
  children: NodeId[];
  parents: NodeId[];
  data: T;
};
