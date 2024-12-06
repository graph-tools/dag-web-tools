import { DirectedAcyclicGraph } from 'dag-web-tools';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';

import { NodeWithData, useDAG } from 'hooks';

import * as T from './types';

export const DirectedAcyclicGraphContext = createContext<
  ReturnType<typeof useDAG<T.NodeData>>
>([
  new DirectedAcyclicGraph<NodeWithData<T.NodeData>>(),
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
    batch: () => {},
  },
]);

export const DirectedAcyclicGraphProvider = ({
  children,
}: PropsWithChildren) => {
  const [instance, actions] = useDAG<T.NodeData>();
  useEffect(() => {
    if (instance.size.nodes === 0) {
      actions.add({ position: { x: 0, y: 0 }, data: {} });
    }
  }, [instance]);

  return (
    <DirectedAcyclicGraphContext.Provider value={[instance, actions]}>
      {children}
    </DirectedAcyclicGraphContext.Provider>
  );
};

export const useDAGContext = () => useContext(DirectedAcyclicGraphContext);

export * from './types';
export * from './utils';
