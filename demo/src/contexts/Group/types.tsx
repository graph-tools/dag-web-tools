import {
  NodeProps as ReactFlowNodeProps,
  Node as ReactFlowNode,
} from '@xyflow/react';

import { DirectedAcyclicGraphActions } from 'hooks';

type Data = {
  disabled?: boolean;
  members?: ReadonlySet<string>;
};

export type GroupData = Omit<ReactFlowNode<Data>, 'id'>;

export type GroupProps = ReactFlowNodeProps<ReactFlowNode<Data>>;

export interface GroupContextActions
  extends DirectedAcyclicGraphActions<GroupData> {
  addMember: (group: string, node: string) => void;
  deleteMember: (group: string, node: string) => void;
  setMembers: (group: string, members: ReadonlySet<string>) => Set<string>;
}
