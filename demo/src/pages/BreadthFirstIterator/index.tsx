import React, { useMemo } from 'react';
import { Background, Controls, MarkerType, ReactFlow } from '@xyflow/react';

import { Panel } from 'components';
import {
  edgeId,
  useSelection,
  useChangeHandlers,
  useConnectionHandlers,
  useMerged,
} from 'hooks';
import { useDAGContext } from 'contexts';
import { DefaultConnectionLine, edgeTypes } from 'edges';
import { nodeTypes } from 'nodes';

import { BreadthFirstIteratorCard } from './card';

export const BreadthFirstIteratorPage = () => {
  const [selected, onSelectionChange] = useSelection();

  const [instance, dag] = useDAGContext();
  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        id: node.id,
        ...node.data,
        type: 'AnyFirstIterator',
        selected: selected.has(node.id),
      })),
    [instance, selected],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].map(([tail, head]) => ({
        id: edgeId(tail.id, head.id),
        type: 'Default',
        source: tail.id,
        target: head.id,
        selected: selected.has(edgeId(tail.id, head.id)),
        markerEnd: { type: MarkerType.Arrow },
      })),
    [instance, selected],
  );

  const [onNodesChange, onEdgesChange] = useChangeHandlers(dag);
  const [onConnect, onConnectEnd] = useConnectionHandlers(dag);

  const onNodesChangeMerged = useMerged(onSelectionChange, onNodesChange);
  const onEdgesChangeMerged = useMerged(onSelectionChange, onEdgesChange);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      onNodesChange={onNodesChangeMerged}
      onEdgesChange={onEdgesChangeMerged}
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
