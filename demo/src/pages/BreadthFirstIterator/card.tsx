import { BreadthFirstIterator } from 'dag-web-tools';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Card } from 'components';
import { getIgnored, getRootNode, useDAGContext, NodeData } from 'contexts';
import { NodeWithData } from 'hooks';

export const BreadthFirstIteratorCard = () => {
  const [instance, dag] = useDAGContext();

  const [depth, setDepth] = useState<number | undefined>();
  const root = useMemo(() => getRootNode(instance), [instance]);

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const iterator = useRef<BreadthFirstIterator<NodeWithData<NodeData>> | null>(
    null,
  );
  const iterating = currentNodeId !== null;

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
        onClick={() =>
          dag.batch(() => {
            if (!iterator.current) {
              iterator.current = new BreadthFirstIterator(instance, root!, {
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
          })
        }
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
