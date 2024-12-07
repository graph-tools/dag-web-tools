import { useCallback, useEffect } from 'react';
import { OnNodesChange, useReactFlow } from '@xyflow/react';

import {
  groupNodes,
  ungroupNodes,
  useDAGContext,
  useGroupContext,
} from '@demo/contexts';

export function useGroupBehaviour(
  [instance, dag]: ReturnType<typeof useDAGContext>,
  [groupsInstance, groups]: ReturnType<typeof useGroupContext>,
) {
  const {
    getInternalNode,
    getNodesBounds,
    getIntersectingNodes,
    isNodeIntersecting,
  } = useReactFlow();

  useEffect(
    () => () => {
      [...groupsInstance.nodes].forEach(({ id, data }) =>
        groups.replace(id, { ...data, data: { ...data.data } }),
      );
      [...instance.nodes].forEach(({ id, data }) =>
        dag.replace(id, { ...data, data: { ...data.data, group: undefined } }),
      );
    },
    [],
  );

  const onNodesChangePre: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        switch (change.type) {
          case 'remove':
            if (groups.has(change.id)) {
              const members = groups.data(change.id)?.data.members;
              members && ungroupNodes(members, dag);
            }
            if (dag.has(change.id)) {
              const group = dag.data(change.id)?.data.group;
              group && groups.deleteMember(group, change.id);
            }
            break;
        }
      });
    },
    [dag, groups],
  );

  const onNodesChangePost: OnNodesChange = useCallback(
    (changes) => {
      const resizedGroups = changes.reduce((resized, change) => {
        change.type === 'dimensions' &&
          groups.has(change.id) &&
          resized.add(change.id);
        return resized;
      }, new Set<string>());
      dag.batch(() =>
        groups.batch(() =>
          changes.forEach((change) => {
            if (change.type === 'add') return;

            if (groups.has(change.id)) {
              const groupRect = getNodesBounds([
                { id: change.id, ...groups.data(change.id)! },
              ]);

              switch (change.type) {
                case 'dimensions': {
                  if (change.resizing) return;

                  const members = new Set(
                    [...instance.nodes]
                      .filter(
                        (node) =>
                          node.data.data.group === undefined ||
                          node.data.data.group === change.id,
                      )
                      .map((node) => node.id)
                      .filter((node) =>
                        isNodeIntersecting(
                          getNodesBounds([getInternalNode(node)!]),
                          groupRect,
                          false,
                        ),
                      ),
                  );
                  groupNodes(members, change.id, dag);
                  ungroupNodes(groups.setMembers(change.id, members), dag);
                  break;
                }

                case 'position': {
                  if (resizedGroups.has(change.id)) return;

                  const position = getInternalNode(change.id)!.internals
                    .positionAbsolute;
                  const delta = {
                    x: change.position!.x - position.x,
                    y: change.position!.y - position.y,
                  };
                  groups.data(change.id)?.data.members?.forEach((member) => {
                    const nodePosition =
                      getInternalNode(member)!.internals.positionAbsolute;
                    dag.replace(member, (data) => ({
                      ...data,
                      position: {
                        x: nodePosition.x + delta.x,
                        y: nodePosition.y + delta.y,
                      },
                    }));
                  });

                  if (change.dragging) return;

                  const members = new Set(
                    [...instance.nodes]
                      .filter(
                        (node) =>
                          node.data.data.group === undefined ||
                          node.data.data.group === change.id,
                      )
                      .map((node) => node.id)
                      .filter((node) =>
                        isNodeIntersecting(
                          getNodesBounds([getInternalNode(node)!]),
                          groupRect,
                          false,
                        ),
                      ),
                  );
                  groupNodes(members, change.id, dag);
                  ungroupNodes(groups.setMembers(change.id, members), dag);
                  break;
                }
              }
            }

            if (dag.has(change.id)) {
              const node = { id: change.id, ...dag.data(change.id)! };
              const nodeRect = getNodesBounds([node]);

              switch (change.type) {
                case 'position': {
                  if (change.dragging) return;

                  const currentGroup = node.data.group;
                  if (
                    currentGroup !== undefined &&
                    resizedGroups.has(currentGroup)
                  ) {
                    return;
                  }

                  const targetGroup = getIntersectingNodes(
                    nodeRect,
                    false,
                    [...groupsInstance.nodes].map(
                      (node) => getInternalNode(node.id)!,
                    ),
                  )[0]?.id;

                  if (currentGroup !== targetGroup) {
                    currentGroup !== undefined &&
                      groups.deleteMember(currentGroup, node.id);
                    if (targetGroup !== undefined) {
                      groupNodes([node.id], targetGroup, dag);
                      groups.addMember(targetGroup, node.id);
                    } else {
                      ungroupNodes([node.id], dag);
                    }
                  }

                  break;
                }
              }
            }
          }),
        ),
      );
    },
    [
      instance,
      dag,
      groupsInstance,
      groups,
      getInternalNode,
      getNodesBounds,
      getIntersectingNodes,
      isNodeIntersecting,
    ],
  );

  return [onNodesChangePre, onNodesChangePost];
}
