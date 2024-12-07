import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Card } from '@demo/components';
import { NodeData, useDAGContext } from '@demo/contexts';
import { NodeWithData } from '@demo/hooks';

export const TopologicalIteratorCard = () => {
  const [instance, dag] = useDAGContext();

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const iterator = useRef<Iterator<NodeWithData<NodeData>> | null>(null);
  const iterating = currentNodeId !== null;

  const iterate = useCallback(
    () =>
      dag.batch(() => {
        if (!iterator.current) {
          iterator.current = instance[Symbol.iterator]();
        }

        const { done, value } = iterator.current.next();
        currentNodeId &&
          dag.replace(currentNodeId, (data) => ({
            ...data,
            data: { ...data.data, loading: false },
          }));

        if (done) {
          iterator.current = null;
          setCurrentNodeId(null);
        } else {
          const node = value;
          dag.replace(node.id, {
            ...node.data,
            data: { ...node.data.data, loading: true },
          });
          setCurrentNodeId(node.id);
        }
      }),
    [currentNodeId, instance],
  );

  useEffect(
    () => () =>
      [...instance.nodes].forEach((node) =>
        dag.replace(node.id, (data) => ({
          ...data,
          data: { ...data.data, loading: false },
        })),
      ),
    [],
  );

  useEffect(
    () =>
      [...instance.nodes].forEach((node) =>
        dag.replace(node.id, (data) => ({
          ...data,
          data: { ...data.data, disabled: currentNodeId !== null },
        })),
      ),
    [currentNodeId],
  );

  return (
    <Card>
      <Card.Title>Topological Iterator</Card.Title>
      <Card.DemoSection
        status={iterating ? 'Next' : 'Iterate'}
        onClick={iterate}
      ></Card.DemoSection>
    </Card>
  );
};
