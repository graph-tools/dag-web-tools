import {
  Node as ReactFlowNode,
  NodeProps as ReactFlowNodeProps,
} from '@xyflow/react';

type Data = {
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

export type NodeData = Omit<ReactFlowNode<Data>, 'id'>;

export type NodeProps = ReactFlowNodeProps<ReactFlowNode<Data>>;
