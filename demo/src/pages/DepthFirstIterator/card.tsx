import { DepthFirstIterator, IteratorInjectOn } from '@self/dag';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Card, Radio } from '@demo/components';
import {
  EdgeData,
  NodeData,
  getIgnored,
  getRootNode,
  useDAGContext,
} from '@demo/contexts';
import { Identified } from '@demo/hooks';

import S from './index.module.css';

const possibleInjectOn = [
  IteratorInjectOn.LEAVE,
  IteratorInjectOn.ENTER,
  IteratorInjectOn.ALL,
];

export const DepthFirstIteratorCard = () => {
  const [instance, dag] = useDAGContext();

  const [depth, setDepth] = useState<number | undefined>();
  const [injectOn, setInjectOn] = useState<IteratorInjectOn | undefined>();
  const root = useMemo(() => getRootNode(instance), [instance]);

  const iterator = useRef<DepthFirstIterator<
    Identified<NodeData>,
    Identified<EdgeData>
  > | null>(null);

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const iterating = currentNodeId !== null;

  const iterate = useCallback(
    () =>
      dag.batch(() => {
        if (!iterator.current) {
          iterator.current = new DepthFirstIterator(instance, root!, {
            depth,
            injectOn,
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
    [currentNodeId, instance, root, depth, injectOn],
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
      <Card.Title>Depth First Iterator</Card.Title>
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
                defaultValue={depth}
                disabled={iterating}
                onChange={(e) =>
                  !Number.isNaN(e.target.valueAsNumber) &&
                  setDepth(e.target.valueAsNumber)
                }
                style={{ pointerEvents: 'all' }}
              />
            </label>
          </Card.Param>
          <Card.Param>
            Choose injection time:
            <div className={S.injectOn}>
              {possibleInjectOn.map((value) => (
                <Radio
                  key={`injectOn:${value}`}
                  name="injectOn"
                  value={value}
                  defaultChecked={injectOn === value}
                  disabled={iterating}
                  onChange={() => setInjectOn(value)}
                  style={{ pointerEvents: 'all' }}
                >
                  {value}
                </Radio>
              ))}
            </div>
          </Card.Param>
        </Card.Params>
      </Card.DemoSection>
    </Card>
  );
};
