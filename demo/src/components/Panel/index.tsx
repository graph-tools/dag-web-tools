import React from 'react';
import { Panel as ReactFlowPanel } from '@xyflow/react';
import cn from 'classnames';

import S from './index.module.css';

export const Panel: typeof ReactFlowPanel = ({ className, ...others }) => (
  <ReactFlowPanel className={cn(S.panel, className)} {...others} />
);
