import { bench, describe } from 'vitest';

import { AbstractDirectedAcyclicGraph } from 'src/models';
import { Layered, MockNode } from 'src/test';

import BreadthFirstIterator from './BreadthFirstIterator';

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

describe('breadth first iterator', () => {
  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  let root: MockNode;
  cases.forEach(({ n, e }) => {
    bench(
      `${n} nodes; ${e} edges`,
      () => {
        [...new BreadthFirstIterator(dag!, root!)];
      },
      {
        setup: () => {
          dag = new Layered([1, n - 1]);

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
