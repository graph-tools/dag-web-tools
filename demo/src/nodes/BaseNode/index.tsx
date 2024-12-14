import React, { PropsWithChildren } from 'react';
import { Handle, Position } from '@xyflow/react';
import cn from 'classnames';

import * as T from './types';
import S from './index.module.css';

export const BaseNode = ({
  selected,
  loading,
  active,
  inactive,
  className,
  children,
}: PropsWithChildren<T.BaseNodeProps>) => {
  return (
    <>
      <div
        className={cn(
          S.node,
          {
            [S.selected]: selected,
            [S.loading]: loading,
            [S.active]: active,
            [S.inactive]: inactive,
          },
          className,
        )}
      >
        {children}
      </div>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
    </>
  );
};
