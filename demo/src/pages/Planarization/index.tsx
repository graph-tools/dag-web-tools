import { OrderedMultipartite } from '@self/dag';

import React, { useEffect, useMemo } from 'react';
import { Background, Controls, Edge, ReactFlow } from '@xyflow/react';

import { Panel } from '@demo/components';
import { groupNodes, useDAGContext, useGroupContext } from '@demo/contexts';
import { DefaultConnectionLine, edgeTypes } from '@demo/edges';
import {
  edgeId,
  useChangeHandlers,
  useConnectionHandlers,
  useGroupBehaviour,
  useMerged,
  useSelection,
} from '@demo/hooks';
import { nodeTypes } from '@demo/nodes';

import { PlanarizationCard } from './card';

export const PlanarizationPage = () => {
  const [instance, dag] = useDAGContext();
  const [selected, onSelectionChange] = useSelection();
  const [groupsInstance, groups] = useGroupContext();

  useEffect(() => {
    dag.clear();

    const a1 = dag.add({ position: { x: 0, y: 0 }, data: {} });
    const a2 = dag.add({ position: { x: 0, y: 100 }, data: {} });
    const a = groups.add({
      position: { x: 0 - 20, y: 0 - 20 },
      height: 300,
      data: {},
    });
    groups.setMembers(a, new Set([a1, a2]));
    groupNodes([a1, a2], a, dag);

    const b1 = dag.add({ position: { x: 200, y: 0 }, data: {} });
    const b2 = dag.add({ position: { x: 200, y: 100 }, data: {} });
    const b3 = dag.add({ position: { x: 200, y: 200 }, data: {} });
    const b = groups.add({
      position: { x: 200 - 20, y: 0 - 20 },
      height: 300,
      data: {},
    });
    groups.setMembers(b, new Set([b1, b2, b3]));
    groupNodes([b1, b2, b3], b, dag);

    const c1 = dag.add({ position: { x: 400, y: 0 }, data: {} });
    const c2 = dag.add({ position: { x: 400, y: 100 }, data: {} });
    const c = groups.add({
      position: { x: 400 - 20, y: 0 - 20 },
      height: 300,
      data: {},
    });
    groups.setMembers(c, new Set([c1, c2]));
    groupNodes([c1, c2], c, dag);

    groups.connect(a, b);
    groups.connect(b, c);
    dag.connect(a1, b2);
    dag.connect(a2, b1);
    dag.connect(a2, b3);
    dag.connect(b1, c2);
    dag.connect(b2, c2);
    dag.connect(b3, c1);

    return () => {
      dag.clear();
      groups.clear();
    };
  }, []);

  const groupedNodes = useMemo(
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
