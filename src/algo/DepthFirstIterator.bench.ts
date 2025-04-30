import { bench, describe } from 'vitest';

import { AbstractDirectedAcyclicGraph } from 'src/models';
import { Chain, MockNode } from 'src/test';

import { DepthFirstIterator } from './DepthFirstIterator';

const sizes = [
  100, 300, 500, 700, 1_000, 3_000, 5_000, 7_000, 10_000, 15_000, 25_000,
];

const cases: { n: number; e: number }[] = [];
for (const n of sizes) {
  for (const e of sizes) {
    if (e < n || (n * (n + 1)) / 2 < e) continue;
    cases.push({ n, e });
  }
}

describe('depth first iterator', () => {
  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  let root: MockNode;
  cases.forEach(({ n, e }) => {
    bench(
      `${n} nodes; ${e} edges`,
      () => {
        [...new DepthFirstIterator(dag!, root!)];
      },
      {
        setup: () => {
          dag = new Chain(n);

          const nodes = [...dag.nodes];
          root = nodes[0];

          for (let tailIndex = 1; tailIndex < nodes.length; ++tailIndex) {
            for (
              let headIndex = tailIndex + 1;
              headIndex < nodes.length;
              ++headIndex
            ) {
              if (dag.size.edges >= e) return;
              dag.connect(nodes[tailIndex], nodes[headIndex]);
            }
          }
        },
      },
    );
  });
});
