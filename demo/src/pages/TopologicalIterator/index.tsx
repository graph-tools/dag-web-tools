import React, { useMemo } from 'react';
import { Background, Controls, ReactFlow } from '@xyflow/react';

import { Panel } from '@demo/components';
import { useDAGContext } from '@demo/contexts';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';
import { useChangeHandlers, useConnectionHandlers } from '@demo/hooks';
import { nodeTypes } from '@demo/nodes';

import { TopologicalIteratorCard } from './card';

export const TopologicalIteratorPage = () => {
  const [instance, dag] = useDAGContext();
  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        ...node.data,
        id: node.id,
        type: 'Deletable',
      })),
    [instance],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].map(([, , edge]) => ({
        ...edge.data,
        id: edge.id,
        type: 'Default',
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
        <TopologicalIteratorCard />
      </Panel>
    </ReactFlow>
  );
};
