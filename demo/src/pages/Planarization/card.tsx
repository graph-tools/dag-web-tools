import { OrderedMultipartite, planarizeDirectedMultipartite } from '@self/dag';
import React, { useCallback } from 'react';

import { Card } from '@demo/components';
import { NodeData, useDAGContext, useGroupContext } from '@demo/contexts';
import { NodeWithData } from '@demo/hooks';

const GAP = 16;
const SIZE = 64;

export const PlanarizationCard = () => {
  const [instance, dag] = useDAGContext();
  const [groupsInstance, groups] = useGroupContext();

  const planarize = useCallback(() => {
    const orderedMultipartite = new OrderedMultipartite<
      NodeWithData<NodeData>
    >();

    let order = 0;
    for (const group of groupsInstance) {
      [...(group.data.data.members?.values() ?? [])]
        ?.map((member) => dag.node(member)!)
        .sort((a, b) =>
          a.data.position.y < b.data.position.y
            ? -1
            : a.data.position > b.data.position
              ? 1
              : 0,
        )
        .forEach((member) => {
          orderedMultipartite.set(member, order);
        });
      order++;
    }

    const planarized = planarizeDirectedMultipartite(
      orderedMultipartite,
      instance,
    );

    for (const [, part] of orderedMultipartite) {
      [...part.values()]
        .map((node) => [planarized.get(node)!, node] as const)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .forEach(([, node], index) => planarized.set(node, index));
    }

    dag.batch(() => {
      groups.batch(() => {
        for (const group of groupsInstance) {
          groups.replace(group.id, {
            ...group.data,
            width: SIZE + GAP + GAP,
            height: (group.data.data.members?.size ?? 0) * (SIZE + GAP) + GAP,
            measured: undefined,
          });
          group.data.data.members?.forEach(
            (member) =>
              dag.node(member) &&
              dag.replace(member, (data) => ({
                ...data,
                position: {
                  x: group.data.position.x + GAP,
                  y:
                    group.data.position.y +
                    (planarized.get(dag.node(member)!) ?? 0) * (SIZE + GAP) +
                    GAP,
                },
              })),
          );
        }
      });
    });
  }, [instance, groupsInstance]);

  return (
    <Card>
      <Card.Title>Multipartite Planarization</Card.Title>
      <Card.DemoSection status={'Planarize'} onClick={planarize}>
        <Card.Params>
          <Card.Param>Group nodes</Card.Param>
        </Card.Params>
      </Card.DemoSection>
    </Card>
  );
};
