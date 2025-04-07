import React from 'react';
import { NodeToolbar, Position, useReactFlow } from '@xyflow/react';

import { NodeProps } from '@demo/contexts';

import { BaseNode } from '../BaseNode';

import { EquivalenceClassMarker } from './marker';

import S from './index.module.css';

export const ClassifiedNode = ({ id, selected, data }: NodeProps) => {
  const { deleteElements } = useReactFlow();

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <button
          disabled={data.disabled}
          onClick={() => deleteElements({ nodes: [{ id }] })}
        >
          ×
        </button>
      </NodeToolbar>
      <BaseNode
        selected={selected}
        loading={data.loading}
        active={data.active}
        inactive={data.inactive}
      >
        {data.equivalenceClassNumber !== undefined ? (
          <EquivalenceClassMarker
            num={data.equivalenceClassNumber}
            className={S.marker}
          />
        ) : (
          id
        )}
      </BaseNode>
    </>
  );
};
