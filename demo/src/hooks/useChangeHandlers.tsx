import { useCallback } from 'react';
import {
  applyNodeChanges,
  Node,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';

import { parseEdgeId, useDAG } from './useDirectedAcyclicGraph';

export function useChangeHandlers(
  dag: ReturnType<typeof useDAG<Omit<Node, 'id'>>>[1],
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
            case 'replace':
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
              dag.connect(change.item.source, change.item.target);
              break;
            case 'remove':
              dag.disconnect(...parseEdgeId(change.id));
              break;
          }
        });
      }),
    [dag],
  );

  return [onNodesChange, onEdgesChange] as const;
}
