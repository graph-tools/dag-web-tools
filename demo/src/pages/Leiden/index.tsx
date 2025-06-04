import React, { useMemo } from 'react';
import { Background, Controls, ReactFlow } from '@xyflow/react';

import { Panel } from '@demo/components';
import { useDAGContext } from '@demo/contexts';
import { nodeTypes } from '@demo/nodes';
import { useChangeHandlers, useConnectionHandlers } from '@demo/hooks';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';

import { LeidenCard } from './card';

export const LeidenPage = () => {
  const [instance, dag] = useDAGContext();
  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        ...node.data,
        id: node.id,
        type: 'Classified',
      })),

    [instance],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].map(([, , edge]) => ({
        ...edge.data,
        id: edge.id,
        type: 'Weighted',
      })),
    [instance],
  );

  const [onNodesChange, onEdgesChange] = useChangeHandlers(dag);
  const [onConnect, onConnectEnd] = useConnectionHandlers(dag);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineComponent={DefaultConnectionLine}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0}
      fitView
    >
      <Background />
      <Controls position="bottom-right" orientation="vertical" />
      <Panel position="top-left">
        <LeidenCard />
      </Panel>
    </ReactFlow>
  );
};
