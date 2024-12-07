import { DirectedAcyclicGraph } from '@self/dag';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { NodeWithData, useDAG } from '@demo/hooks';

import * as T from './types';

export const GroupContext = createContext<
  [ReturnType<typeof useDAG<T.GroupData>>[0], T.GroupContextActions]
>([
  new DirectedAcyclicGraph<NodeWithData<T.GroupData>>(),
  {
    has: () => false,
    node: () => undefined,
    data: () => undefined,
    clear: () => {},
    add: () => '',
    delete: () => {},
    replace: () => {},
    connect: () => {},
    disconnect: () => {},
    addMember: () => {},
    deleteMember: () => {},
    setMembers: () => new Set<string>(),
    batch: () => {},
  },
]);

export const GroupProvider = ({ children }: PropsWithChildren) => {
  const [instance, actions] = useDAG<T.GroupData>();
  useEffect(() => {
    if (instance.size.nodes === 0) {
      actions.add({ position: { x: 0, y: 0 }, data: {} });
    }
  }, [instance]);

  const groupActions = useMemo<T.GroupContextActions>(
    () => ({
      addMember: (group, node) =>
        actions.replace(group, (data) => ({
          ...data,
          data: { ...data.data, members: new Set(data.data.members).add(node) },
        })),
      deleteMember: (group, node) =>
        actions.data(group)?.data.members?.has(node) &&
        actions.replace(group, (data) => {
          const members = new Set(data.data.members);
          members.delete(node);
          data.data.members = members;
          return data;
        }),
      setMembers: (group: string, members: ReadonlySet<string>) => {
        const difference = new Set<string>();
        actions
          .data(group)
          ?.data.members?.forEach(
            (member) => !members.has(member) && difference.add(member),
          );

        actions.replace(group, (data) => ({
          ...data,
          data: { ...data.data, members: members },
        }));

        return difference;
      },
      ...actions,
    }),
    [actions],
  );

  return (
    <GroupContext.Provider value={[instance, groupActions]}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = () => useContext(GroupContext);

export * from './types';
