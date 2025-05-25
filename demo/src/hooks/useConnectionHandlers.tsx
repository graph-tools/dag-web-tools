import { useCallback } from 'react';
import {
  Edge,
  Node,
  OnConnect,
  OnConnectEnd,
  useReactFlow,
} from '@xyflow/react';

import { useDAG } from './useDirectedAcyclicGraph';

export function useConnectionHandlers(
  dag: ReturnType<typeof useDAG<Omit<Node, 'id'>, Omit<Edge, 'id'>>>[1],
) {
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) => {
      dag.connect(params.source, params.target, {
        source: params.source,
        target: params.target,
      });
    },
    [dag],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      const fromNode = connectionState.fromNode;
      if (!connectionState.isValid && fromNode && dag.has(fromNode.id)) {
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const node = {
          type: fromNode.type,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {},
        };

        dag.batch(() => {
          const id = dag.add(node);

          let source = fromNode.id;
          let target = connectionState.toNode?.id ?? id;
          if (connectionState.fromHandle?.type === 'target') {
            [source, target] = [target, source];
          }

          dag.connect(source, target, { source, target });
        });
      }
    },
    [dag, screenToFlowPosition],
  );

  return [onConnect, onConnectEnd] as const;
}
