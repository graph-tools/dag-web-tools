import {
  getEquivalentNodesByParents,
  getEquivalentNodesByChildren,
  getEquivalentNodes,
} from '@self/dag';
import React, { useCallback, useEffect, useState } from 'react';

import { Card, Radio } from '@demo/components';
import { NodeData, useDAGContext } from '@demo/contexts';
import { Identified } from '@demo/hooks';

import * as T from './types';
import S from './index.module.css';

const availableEquivalenceBy = [
  T.EquivalenceBy.PARENTS,
  T.EquivalenceBy.CHILDREN,
  T.EquivalenceBy.BOTH,
];

export const EquivalentNodesCard = () => {
  const [instance, dag] = useDAGContext();

  const [equivalenceBy, setEquivalenceBy] = useState<
    T.EquivalenceBy | undefined
  >();

  const groupByEquivalenceClass = useCallback(
    () =>
      dag.batch(() => {
        if (equivalenceBy == undefined) return;

        let projection;
        switch (equivalenceBy) {
          case T.EquivalenceBy.PARENTS:
            projection = getEquivalentNodesByParents(
              instance,
              new Set(instance.nodes),
            );
            break;
          case T.EquivalenceBy.CHILDREN:
            projection = getEquivalentNodesByChildren(
              instance,
              new Set(instance.nodes),
            );
            break;
          case T.EquivalenceBy.BOTH:
            projection = getEquivalentNodes(instance, new Set(instance.nodes));
            break;
        }

        let classNumber = 0;
        const classified = new Set<Set<Identified<NodeData>>>();
        for (const [, cls] of projection.entries()) {
          if (classified.has(cls)) continue;

          for (const node of cls) {
            dag.replace(node.id, {
              ...node.data,
              data: { ...node.data, equivalenceClassNumber: classNumber },
            });
          }
          classified.add(cls);
          ++classNumber;
        }
      }),
    [instance, equivalenceBy],
  );

  useEffect(
    () => () =>
      [...instance.nodes].forEach((node) =>
        dag.replace(node.id, (data) => ({
          ...data,
          data: { ...data.data, equivalenceClassNumber: undefined },
        })),
      ),
    [],
  );

  return (
    <Card>
      <Card.Title>Equivalent Nodes</Card.Title>
      <Card.DemoSection
        status={'Group by equivalence class'}
        disabled={equivalenceBy === undefined}
        onClick={groupByEquivalenceClass}
      >
        <Card.Params>
          <Card.Param required done={equivalenceBy !== undefined}>
            Choose node equivalence type:
            <div className={S.equivalenceBy}>
              {availableEquivalenceBy.map((value) => (
                <Radio
                  key={`equivalenceBy:${value}`}
                  name="equivalenceBy"
                  value={value}
                  defaultChecked={equivalenceBy === value}
                  onChange={() => setEquivalenceBy(value)}
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
