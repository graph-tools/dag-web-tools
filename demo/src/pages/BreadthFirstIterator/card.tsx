import { BreadthFirstIterator } from '@self/dag';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Card } from '@demo/components';
import {
  getIgnored,
  getRootNode,
  useDAGContext,
  NodeData,
  EdgeData,
} from '@demo/contexts';
import { Identified } from '@demo/hooks';

export const BreadthFirstIteratorCard = () => {
  const [instance, dag] = useDAGContext();

  const root = useMemo(() => getRootNode(instance), [instance]);
  const [depth, setDepth] = useState<number | undefined>();

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const iterator = useRef<BreadthFirstIterator<
    Identified<NodeData>,
    Identified<EdgeData>
  > | null>(null);
  const iterating = currentNodeId !== null;

  const iterate = useCallback(
    () =>
      dag.batch(() => {
        if (root === null) return;
        if (!iterator.current) {
          iterator.current = new BreadthFirstIterator(instance, root, {
            depth,
            ignore: new Set(getIgnored(instance)),
          });
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
          const [node] = value;
          dag.replace(node.id, {
            ...node.data,
            data: { ...node.data.data, loading: true },
          });
          setCurrentNodeId(node.id);
        }
      }),
    [currentNodeId, instance, root, depth],
  );

  useEffect(
    () => () =>
      [...instance.nodes].forEach((node) =>
        dag.replace(node.id, (data) => ({
          ...data,
          data: { ...data.data, loading: false, disabled: false },
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
      <Card.Title>Breadth First Iterator</Card.Title>
      <Card.DemoSection
        status={iterating ? 'Next' : 'Iterate'}
        disabled={!root}
        onClick={iterate}
      >
        <Card.Params>
          <Card.Param done={Boolean(root)} required>
            Select root
          </Card.Param>
          <Card.Param>Check nodes to ignore</Card.Param>
          <Card.Param>
            <label>
              Iteration depth:
              <input
                type="number"
                style={{ pointerEvents: 'all' }}
                defaultValue={depth}
                disabled={iterating}
                onChange={(e) =>
                  !Number.isNaN(e.target.valueAsNumber) &&
                  setDepth(e.target.valueAsNumber)
                }
              />
            </label>
          </Card.Param>
        </Card.Params>
      </Card.DemoSection>
    </Card>
  );
};
