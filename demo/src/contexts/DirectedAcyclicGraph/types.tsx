import {
  Node as ReactFlowNode,
  NodeProps as ReactFlowNodeProps,
  Edge as ReactFlowEdge,
  EdgeProps as ReactFlowEdgeProps,
} from '@xyflow/react';

type Node = {
  /** General */
  loading?: boolean;
  active?: boolean;
  inactive?: boolean;
  disabled?: boolean;
  group?: string;

  /** Demo case specific */
  root?: boolean;
  ignored?: boolean;
  equivalenceClassNumber?: number;
};

export type NodeData = Omit<ReactFlowNode<Node>, 'id'>;

export type NodeProps = ReactFlowNodeProps<ReactFlowNode<Node>>;

type Edge = {
  weight?: number;
};

export type EdgeData = Omit<ReactFlowEdge<Edge>, 'id'>;

export type EdgeProps = ReactFlowEdgeProps<ReactFlowEdge<Edge>>;
