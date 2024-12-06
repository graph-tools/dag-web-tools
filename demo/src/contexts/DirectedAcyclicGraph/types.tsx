import {
  Node as ReactFlowNode,
  NodeProps as ReactFlowNodeProps,
} from '@xyflow/react';

type Data = {
  root?: boolean;
  ignored?: boolean;
  loading?: boolean;
  active?: boolean;
  inactive?: boolean;
  disabled?: boolean;
  group?: string;
};

export type NodeData = Omit<ReactFlowNode<Data>, 'id'>;

export type NodeProps = ReactFlowNodeProps<ReactFlowNode<Data>>;
