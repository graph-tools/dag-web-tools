import {
  leiden,
  ConstantPottsPartitioning,
  ReichardtBornholdtPartitioning,
  LeidenPartitioning,
} from '@self/dag';
import React, { useCallback, useEffect, useState } from 'react';

import { Card } from '@demo/components';
import { EdgeData, NodeData, useDAGContext } from '@demo/contexts';
import { Identified } from '@demo/hooks';

import * as T from './types';

const models = [
  T.Model.MODULARITY,
  T.Model.REICHARDT_BORNHOLDT_POTTS,
  T.Model.CONSTANT_POTTS,
];

export const LeidenCard = () => {
  const [instance, dag] = useDAGContext();

  const [resolution, setResolution] = useState<number>(1);
  const [model, setModel] = useState<T.Model>(T.Model.MODULARITY);

  const group = useCallback(
    () =>
      dag.batch(() => {
        let partitioning: LeidenPartitioning<
          Identified<NodeData>,
          Identified<EdgeData>
        >;

        switch (model) {
          case T.Model.MODULARITY:
            partitioning = new ReichardtBornholdtPartitioning({
              resolution: 1,
            });
            break;
          case T.Model.REICHARDT_BORNHOLDT_POTTS:
            partitioning = new ReichardtBornholdtPartitioning({
              resolution: resolution ?? 1,
            });
            break;
          case T.Model.CONSTANT_POTTS:
            partitioning = new ConstantPottsPartitioning({
              resolution: resolution ?? 1,
            });
            break;
        }

        const partition = leiden<Identified<NodeData>, Identified<EdgeData>>(
          instance,
          (tail, head) => {
            const edge = instance.edge(tail, head);
            if (edge) return edge.data.data.data?.weight ?? 1;
            else return 0;
          },
          { partitioning },
        );

        dag.batch(() => {
          let classNumber = 0;
          for (const part of partition) {
            for (const node of part) {
              dag.replace(node.id, {
                ...node.data,
                data: { ...node.data, equivalenceClassNumber: classNumber },
              });
            }
            ++classNumber;
          }
        });
      }),
    [instance, model],
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

  useEffect(() => {
    console.log(model);
  }, [model]);

  return (
    <Card>
      <Card.Title>Leiden Algorithm</Card.Title>
      <Card.DemoSection status={'Run Leiden algorithm'} onClick={group}>
        <Card.Params>
          <Card.Param>Change edge weights</Card.Param>
          <Card.Param required done={model !== undefined}>
            Choose model:
            <select
              style={{ pointerEvents: 'all' }}
              onChange={(e) => setModel(e.target.value as T.Model)}
            >
              {models.map((option) => (
                <option
                  key={`model:${option}`}
                  value={option}
                  defaultChecked={option === model}
                >
                  {option}
                </option>
              ))}
            </select>
          </Card.Param>
          {model !== T.Model.MODULARITY && (
            <Card.Param>
              Resolution parameter:
              <input
                type="number"
                defaultValue={resolution}
                onInput={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  if (!Number.isNaN(value)) setResolution(value);
                }}
                style={{ pointerEvents: 'all' }}
              />
            </Card.Param>
          )}
        </Card.Params>
      </Card.DemoSection>
    </Card>
  );
};
