import { useCallback } from 'react';
import {
  applyNodeChanges,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';

import { parseEdgeId, useDAG } from './useDirectedAcyclicGraph';

export function useChangeHandlers(
  dag: ReturnType<typeof useDAG<Omit<Node, 'id'>, Omit<Edge, 'id'>>>[1],
) {
  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      dag.batch(() => {
        changes.forEach((change) => {
          switch (change.type) {
            case 'position':
            case 'dimensions':
              dag.replace(
                change.id,
                (data) =>
                  applyNodeChanges([change], [{ id: change.id, ...data }])[0],
              );
              break;
            case 'remove':
              dag.delete(change.id);
              break;
            case 'add':
              dag.add(change.item);
              break;
            case 'select':
              dag.replace(change.id, (data) => ({
                ...data,
                selected: change.selected,
              }));
              break;
          }
        });
      }),
    [dag],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      dag.batch(() => {
        changes.forEach((change) => {
          switch (change.type) {
            case 'add':
              dag.connect(change.item.source, change.item.target, change.item);
              break;
            case 'remove':
              dag.disconnect(...parseEdgeId(change.id));
              break;
            case 'select':
              dag.replaceEdge(change.id, (data) => ({
                ...data,
                selected: change.selected,
              }));
          }
        });
      }),
    [dag],
  );

  return [onNodesChange, onEdgesChange] as const;
}
