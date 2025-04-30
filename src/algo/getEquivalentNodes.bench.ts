import { bench, describe } from 'vitest';

import { AbstractDirectedAcyclicGraph } from 'src/models';
import { Layered, MockNode } from 'src/test';

import { getEquivalentNodes } from '..';

const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000];

describe('get equivalent nodes', () => {
  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  sizes.forEach((n) => {
    bench(
      `${n} nodes; ${(n / 2) * (n / 2)} edges`,
      () => {
        getEquivalentNodes(dag, new Set(dag.nodes));
      },
      {
        iterations: 100,
        setup: () => {
          dag = new Layered([n / 2, n / 2]);
        },
      },
    );
  });
});
