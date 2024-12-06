import React from 'react';
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
} from '@xyflow/react';

import { GroupProps } from 'contexts';

import S from './index.module.css';

export const PartitionNode = ({ id, data }: GroupProps) => {
  const { deleteElements } = useReactFlow();
  return (
    <>
      <NodeToolbar style={{ zIndex: 9999 }}>
        <button
          disabled={data.disabled}
          onClick={() => deleteElements({ nodes: [{ id }] })}
        >
          ×
        </button>
      </NodeToolbar>
      <NodeResizer />
      <div className={S.group}></div>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </>
  );
};
