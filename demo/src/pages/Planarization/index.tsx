import { OrderedMultipartite } from '@self/dag';

import React, { useEffect, useMemo } from 'react';
import { Background, Controls, Edge, ReactFlow } from '@xyflow/react';

import { Panel } from '@demo/components';
import { useDAGContext, useGroupContext } from '@demo/contexts';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';
import {
  useChangeHandlers,
  useConnectionHandlers,
  useGroupBehaviour,
  useMerged,
} from '@demo/hooks';
import { nodeTypes } from '@demo/nodes';

import { PlanarizationCard } from './card';

export const PlanarizationPage = () => {
  const [instance, dag] = useDAGContext();
  const [groupsInstance, groups] = useGroupContext();

  useEffect(() => {
    return () => {
      groups.clear();
    };
  }, []);

  const groupedNodes = useMemo(
    () =>
      [...groupsInstance.nodes].map((node) => ({
        ...node.data,
        id: node.id,
        type: 'Partition',
        zIndex: -1,
      })),
    [groupsInstance],
  );
  const orderEdges = useMemo(
    () =>
      [...groupsInstance.edges].map(([, , edge]) => ({
        ...edge.data,
        id: edge.id,
        type: 'Default',
      })),
    [groupsInstance],
  );
  const ordered = useMemo(() => {
    const ordered = new OrderedMultipartite<string>();
    let i = 0;
    for (const group of groupsInstance) {
      if (group.data.data.members === undefined) continue;
      for (const member of group.data.data.members) {
        ordered.set(member, i);
      }
      ++i;
    }
    return ordered;
  }, [groupsInstance]);

  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        ...node.data,
        id: node.id,
        type: 'Deletable',
        data: {
          ...node.data.data,
          active: node.data.data.group !== undefined,
          inactive: node.data.data.group === undefined,
        },
      })),
    [instance],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].reduce((edges, [tail, head, edge]) => {
        const tailGroup = dag.data(tail.id)?.data.group;
        const headGroup = dag.data(head.id)?.data.group;

        const show =
          tailGroup === undefined ||
          headGroup === undefined ||
          tailGroup !== headGroup;

        const active =
          tailGroup !== undefined &&
          headGroup !== undefined &&
          ordered.orderOf(tail.id)! < ordered.orderOf(head.id)!;

        show &&
          edges.push({
            ...edge.data,
            id: edge.id,
            type: 'Default',
            data: {
              ...edge.data.data,
              active,
              inactive: !active,
            },
            zIndex: !active ? -1 : undefined,
          });
        return edges;
      }, [] as Edge[]),
    [instance, ordered],
  );

  const [onGroupsChange, onOrdersChange] = useChangeHandlers(groups);
  const [onOrder, onOrderingEnd] = useConnectionHandlers(groups);
  const [onNodesChange, onEdgesChange] = useChangeHandlers(dag);
  const [onConnect, onConnectEnd] = useConnectionHandlers(dag);
  const [onGroupingChangePre, onGroupingChangePost] = useGroupBehaviour(
    [instance, dag],
    [groupsInstance, groups],
  );

  const onNodesChangeMerged = useMerged(
    onGroupingChangePre,
    onNodesChange,
    onGroupsChange,
    onGroupingChangePost,
  );
  const onEdgesChangeMerged = useMerged(onEdgesChange, onOrdersChange);
  const onConnectMerged = useMerged(onConnect, onOrder);
  const onConnectEndMerged = useMerged(onConnectEnd, onOrderingEnd);

  return (
    <ReactFlow
      nodes={[...groupedNodes, ...nodes]}
      edges={[...orderEdges, ...edges]}
      onConnect={onConnectMerged}
      onConnectEnd={onConnectEndMerged}
      onNodesChange={onNodesChangeMerged}
      onEdgesChange={onEdgesChangeMerged}
      connectionLineComponent={DefaultConnectionLine}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      elevateNodesOnSelect={false}
      minZoom={0}
      fitView
    >
      <Background />
      <Controls position="bottom-right" orientation="vertical" />
      <Panel position="top-left">
        <PlanarizationCard />
      </Panel>
    </ReactFlow>
  );
};
