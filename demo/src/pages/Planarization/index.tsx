import { OrderedMultipartite } from 'dag-web-tools';

import React, { useEffect, useMemo } from 'react';
import { Background, Controls, Edge, ReactFlow } from '@xyflow/react';

import { Panel } from 'components';
import { useDAGContext, useGroupContext } from 'contexts';
import { DefaultConnectionLine, edgeTypes } from 'edges';
import {
  edgeId,
  useChangeHandlers,
  useConnectionHandlers,
  useGroupBehaviour,
  useMerged,
  useSelection,
} from 'hooks';
import { nodeTypes } from 'nodes';

import { PlanarizationCard } from './card';

export const PlanarizationPage = () => {
  const [selected, onSelectionChange] = useSelection();
  const [groupsInstance, groups] = useGroupContext();
  const groupNodes = useMemo(
    () =>
      [...groupsInstance.nodes].map((node) => ({
        id: node.id,
        ...node.data,
        type: 'Partition',
        selected: selected.has(node.id),
        zIndex: -1,
      })),
    [groupsInstance],
  );
  const orderEdges = useMemo(
    () =>
      [...groupsInstance.edges].map(([tail, head]) => ({
        id: edgeId(tail.id, head.id),
        type: 'Default',
        source: tail.id,
        target: head.id,
        selected: selected.has(edgeId(tail.id, head.id)),
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

  const [instance, dag] = useDAGContext();
  const nodes = useMemo(
    () =>
      [...instance.nodes].map((node) => ({
        id: node.id,
        ...node.data,
        data: {
          ...node.data.data,
          active: node.data.data.group !== undefined,
          inactive: node.data.data.group === undefined,
        },
        type: 'Deletable',
        selected: selected.has(node.id),
      })),
    [instance],
  );
  const edges = useMemo(
    () =>
      [...instance.edges].reduce((edges, [tail, head]) => {
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
            id: edgeId(tail.id, head.id),
            source: tail.id,
            target: head.id,
            type: 'Default',
            selected: selected.has(edgeId(tail.id, head.id)),
            data: {
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
    onSelectionChange,
    onNodesChange,
    onGroupsChange,
    onGroupingChangePost,
  );
  const onEdgesChangeMerged = useMerged(
    onSelectionChange,
    onEdgesChange,
    onOrdersChange,
  );
  const onConnectMerged = useMerged(onConnect, onOrder);
  const onConnectEndMerged = useMerged(onConnectEnd, onOrderingEnd);

  useEffect(() => () => groups.clear(), []);

  return (
    <ReactFlow
      nodes={[...groupNodes, ...nodes]}
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
