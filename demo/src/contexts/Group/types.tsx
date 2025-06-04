import {
  NodeProps as ReactFlowNodeProps,
  Node as ReactFlowNode,
  EdgeProps as ReactFlowEdgeProps,
  Edge as ReactFlowEdge,
} from '@xyflow/react';

import { DirectedAcyclicGraphActions } from '@demo/hooks';

type Node = {
  disabled?: boolean;
  members?: ReadonlySet<string>;
};

export type GroupData = Omit<ReactFlowNode<Node>, 'id'>;

export type GroupProps = ReactFlowNodeProps<ReactFlowNode<Node>>;

type Edge = Record<string, unknown>;

export type GroupEdgeData = Omit<ReactFlowEdge<Edge>, 'id'>;

export type GroupEdgeProps = ReactFlowEdgeProps<ReactFlowEdge<Edge>>;

export interface GroupContextActions
  extends DirectedAcyclicGraphActions<GroupData, GroupEdgeData> {
  addMember: (group: string, node: string) => void;
  deleteMember: (group: string, node: string) => void;
  setMembers: (group: string, members: ReadonlySet<string>) => Set<string>;
}
