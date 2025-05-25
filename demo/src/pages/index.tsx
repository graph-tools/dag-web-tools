import React, { useMemo } from 'react';
import { Background, Controls, MarkerType, ReactFlow } from '@xyflow/react';

import TopsortLogo from '@demo/assets/topsort.svg';
import DfsLogo from '@demo/assets/dfs.svg';
import BfsLogo from '@demo/assets/bfs.svg';
import EquivalentLogo from '@demo/assets/equivalent.svg';
import PlanarizationLogo from '@demo/assets/planarization.svg';

import { Panel, Navigation } from '@demo/components';
import { useDAGContext } from '@demo/contexts';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';
import { useChangeHandlers, useConnectionHandlers } from '@demo/hooks';
import { nodeTypes } from '@demo/nodes';

export const DemoNavigation = ({ className }: { className?: string }) => (
  <Navigation className={className}>
    <Navigation.Group title="Iterators">
      <Navigation.Item logo={TopsortLogo} href="/iterator">
        Topological
      </Navigation.Item>
      <Navigation.Item logo={DfsLogo} href="/iterator/dfs">
        DFS
      </Navigation.Item>
      <Navigation.Item logo={BfsLogo} href="/iterator/bfs">
        BFS
      </Navigation.Item>
    </Navigation.Group>
    <Navigation.Group title="Nodes">
      <Navigation.Item logo={EquivalentLogo} href="/nodes/equivalent">
        Equivalent
      </Navigation.Item>
    </Navigation.Group>
    <Navigation.Group title="Layouts">
      <Navigation.Item logo={PlanarizationLogo} href="/layout/planarization">
        Planarize Multipartite
      </Navigation.Item>
    </Navigation.Group>
  </Navigation>
);

export const IndexPage = () => {
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
        <DemoNavigation />
      </Panel>
    </ReactFlow>
  );
};

export * from './TopologicalIterator';
export * from './BreadthFirstIterator';
export * from './DepthFirstIterator';
export * from './EquivalentNodes';
export * from './Planarization';
