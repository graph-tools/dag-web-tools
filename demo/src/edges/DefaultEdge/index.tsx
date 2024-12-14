import React from 'react';
import {
  BaseEdge,
  ConnectionLineComponentProps,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
  InternalNode,
  useInternalNode,
  useReactFlow,
  XYPosition,
} from '@xyflow/react';
import cn from 'classnames';

import { nodeShapes, Shape } from '@demo/nodes';

import S from './index.module.css';

export function getCenter(node: InternalNode) {
  return {
    x: node.internals.positionAbsolute.x + node.measured.width! / 2,
    y: node.internals.positionAbsolute.y + node.measured.height! / 2,
  };
}

export function getCircleDelta(
  node: InternalNode,
  vec: XYPosition,
  gap: number,
) {
  const size = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  return {
    x: ((node.measured.width! / 2 + gap) / size) * vec.x,
    y: ((node.measured.height! / 2 + gap) / size) * vec.y,
  };
}

export function getRectangleDelta(
  node: InternalNode,
  a: XYPosition,
  gap: number,
) {
  const treshold =
    node.measured.width !== 0
      ? node.measured.height! / node.measured.width!
      : 0;
  const sin = a.x !== 0 ? Math.abs(a.y) / Math.abs(a.x) : 0;
  const intersectingTopBottom = sin >= treshold;
  const intersectingLeftRight = sin <= treshold;
  const totalX = node.measured.width! / 2 + gap;
  const totalY = node.measured.height! / 2 + gap;

  const delta = {
    x: intersectingLeftRight ? totalX : sin !== 0 ? totalY / sin : 0,
    y: intersectingTopBottom ? totalY : totalX * sin,
  };
  delta.x *= a.x > 0 ? 1 : -1;
  delta.y *= a.y > 0 ? 1 : -1;

  return delta;
}

export function getDelta(node: InternalNode, a: XYPosition, gap: number = 8) {
  if (node.type === undefined) return { x: 0, y: 0 };
  switch (nodeShapes[node.type]) {
    case Shape.CIRCLE:
      return getCircleDelta(node, a, gap);
    case Shape.RECTANGLE:
      return getRectangleDelta(node, a, gap);
    default:
      return { x: 0, y: 0 };
  }
}

export function getConnectionParams(
  source: InternalNode,
  targetCenter: XYPosition,
  options: { gap: number } = { gap: 8 },
) {
  const sourceCenter = getCenter(source);
  const a = {
    x: targetCenter.x - sourceCenter.x,
    y: targetCenter.y - sourceCenter.y,
  };

  const sourceDelta = getDelta(source, a, options.gap);

  return {
    sourceX: sourceCenter.x + sourceDelta.x,
    sourceY: sourceCenter.y + sourceDelta.y,
    targetX: targetCenter.x,
    targetY: targetCenter.y,
  };
}

export function getEdgeParams(
  source: InternalNode,
  target: InternalNode,
  options: { gap: number } = { gap: 8 },
) {
  const sourceCenter = getCenter(source);
  const targetCenter = getCenter(target);
  const a = {
    x: targetCenter.x - sourceCenter.x,
    y: targetCenter.y - sourceCenter.y,
  };

  const sourceDelta = getDelta(source, a, options.gap);
  const targetDelta = getDelta(target, a, options.gap);

  return {
    sourceX: sourceCenter.x + sourceDelta.x,
    sourceY: sourceCenter.y + sourceDelta.y,
    targetX: targetCenter.x - targetDelta.x,
    targetY: targetCenter.y - targetDelta.y,
  };
}

export const DefaultEdge = ({
  id,
  source,
  target,
  style = {},
  selected,
  data,
}: EdgeProps) => {
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
