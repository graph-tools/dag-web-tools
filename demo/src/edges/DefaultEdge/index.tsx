import React from 'react';
import {
  BaseEdge,
  ConnectionLineComponentProps,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
  useInternalNode,
  useReactFlow,
} from '@xyflow/react';
import cn from 'classnames';

import { getConnectionParams, getEdgeParams } from '../utils';

import S from './index.module.css';

export const DefaultEdge = ({
  id,
  source,
  target,
  style = {},
  selected,
  data,
}: EdgeProps<Edge<{ active: boolean; inactive: boolean }>>) => {
  const { deleteElements } = useReactFlow();
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const [edgePath, labelX, labelY] = getStraightPath(
    getEdgeParams(sourceNode!, targetNode!),
  );

  let marker = 'arrow';
  if (data?.inactive) marker = 'arrow_inactive';
  if (selected) marker = 'arrow_selected';
  if (data?.active) marker = 'arrow_active';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#${marker})`}
        style={{ stroke: data?.active ? 'blue' : undefined, ...style }}
        className={cn(S.edge, {
          [S.selected]: selected,
          [S.active]: data?.active,
          [S.inactive]: data?.inactive,
        })}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          {selected && (
            <button onClick={() => deleteElements({ edges: [{ id }] })}>
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const connectionLineStyle = {
  stroke: '#b1b1b7',
};

export const DefaultConnectionLine = ({
  fromNode,
  toX,
  toY,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getStraightPath(
    getConnectionParams(fromNode, { x: toX, y: toY }),
  );

  return (
    <g>
      <path fill="none" style={connectionLineStyle} d={edgePath} />
    </g>
  );
};
