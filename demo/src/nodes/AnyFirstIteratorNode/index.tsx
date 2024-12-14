import React, { ChangeEvent, useCallback } from 'react';
import { NodeToolbar } from '@xyflow/react';

import { Checkbox } from '@demo/components';
import { NodeProps, getRootNode, useDAGContext } from '@demo/contexts';

import { BaseNode } from '../BaseNode';
import S from './index.module.css';

export const AnyFirstIteratorNode = ({ id, selected, data }: NodeProps) => {
  const [instance, dag] = useDAGContext();
  const { root, ignored, loading, disabled } = data;

  const setRoot = useCallback(() => {
    const rootId = getRootNode(instance)?.id;

    dag.batch(() => {
      dag.replace(id, (data) => ({
        ...data,
        data: { ...data.data, root: true },
      }));
      rootId &&
        dag.replace(rootId, (data) => ({
          ...data,
          data: { ...data.data, root: false },
        }));
    });
  }, [instance]);

  const toggleIgnored = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dag.replace(id, (data) => ({
      ...data,
      data: { ...data.data, ignored: e.target.checked },
    }));
  }, []);

  return (
    <>
      <NodeToolbar className={S.toolbar}>
        {!root && (
          <button onClick={setRoot} disabled={disabled}>
            Set root
          </button>
        )}
        <Checkbox
          defaultChecked={ignored}
          disabled={disabled}
          onChange={toggleIgnored}
        >
          Ignore
        </Checkbox>
        <button disabled={data.disabled} onClick={() => dag.delete(id)}>
          ×
        </button>
      </NodeToolbar>
      <div className={S.wrapper}>
        <BaseNode
          selected={selected}
          loading={loading}
          active={root}
          inactive={ignored}
        >
          {id}
        </BaseNode>
      </div>
    </>
  );
};
