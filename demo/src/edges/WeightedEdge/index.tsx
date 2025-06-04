import React from 'react';
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
  useInternalNode,
  useReactFlow,
} from '@xyflow/react';
import cn from 'classnames';

import { getEdgeParams } from '../utils';

import S from './index.module.css';
import { useDAGContext } from '@demo/contexts';

export const WeightedEdge = ({
  id,
  source,
  target,
  style = {},
  selected,
  data,
}: EdgeProps<Edge<{ weight: number }>>) => {
  const { deleteElements } = useReactFlow();
  const [, dag] = useDAGContext();

  const weight = data?.weight ?? 1;
  const width = Math.min(Math.max(1, weight * 0.5), 10);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const [edgePath, labelX, labelY] = getStraightPath(
    getEdgeParams(sourceNode!, targetNode!, { gap: [8, 8 + width * 2] }),
  );

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={selected ? 'url(#arrow_selected)' : 'url(#arrow)'}
        style={{
          strokeWidth: width,
          ...style,
        }}
        className={cn(S.edge, {
          [S.selected]: selected,
        })}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={S.toolbar}
        >
          {selected && (
            <>
              <input
                type="number"
                className={S.weight}
                defaultValue={weight}
                onChange={(e) =>
                  dag.replaceEdge(id, (data) => ({
                    ...data,
                    data: {
                      ...data.data,
                      weight: Number.isNaN(e.target.valueAsNumber)
                        ? 1
                        : e.target.valueAsNumber,
                    },
                  }))
                }
              />
              <button onClick={() => deleteElements({ edges: [{ id }] })}>
                ×
              </button>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
