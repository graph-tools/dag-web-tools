import React, { useMemo } from 'react';
import { Background, Controls, MarkerType, ReactFlow } from '@xyflow/react';

import { Panel } from '@demo/components';
import { useChangeHandlers, useConnectionHandlers } from '@demo/hooks';
import { useDAGContext } from '@demo/contexts';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';
import { nodeTypes } from '@demo/nodes';

import { BreadthFirstIteratorCard } from './card';

export const BreadthFirstIteratorPage = () => {
  const [instance, dag] = useDAGContext();
  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        ...node.data,
        id: node.id,
        type: 'AnyFirstIterator',
      })),
    [instance],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].map(([, , edge]) => ({
        ...edge.data,
        id: edge.id,
        type: 'Default',
        markerEnd: { type: MarkerType.Arrow },
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
        <BreadthFirstIteratorCard />
      </Panel>
    </ReactFlow>
  );
};
