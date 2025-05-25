import { DirectedAcyclicGraph } from '@self/dag';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';

import { Identified, useDAG } from '@demo/hooks';

import * as T from './types';

export const DirectedAcyclicGraphContext = createContext<
  ReturnType<typeof useDAG<T.NodeData, T.EdgeData>>
>([
  new DirectedAcyclicGraph<Identified<T.NodeData>, Identified<T.EdgeData>>(),
  {
    has: () => false,
    node: () => undefined,
    edge: () => undefined,
    data: () => undefined,
    clear: () => {},
    add: () => '',
    delete: () => {},
    replace: () => {},
    connect: () => {},
    disconnect: () => {},
    replaceEdge: () => {},
    batch: () => {},
  },
]);

export const DirectedAcyclicGraphProvider = ({
  children,
}: PropsWithChildren) => {
  const [instance, actions] = useDAG<T.NodeData, T.EdgeData>();

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
