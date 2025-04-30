import { bench, describe } from 'vitest';

import {
  AbstractDirectedAcyclicGraph,
  AbstractDirectedMultipartite,
} from 'src/models';
import { Layered, MockNode } from 'src/test';

import { OrderedMultipartite, planarizeDirectedMultipartite } from '..';

const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000];

describe('planarize directed multipartite', () => {
  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  let multipartite: AbstractDirectedMultipartite<MockNode>;
  sizes.forEach((n) => {
    bench(
      `${n} nodes; ${(n / 2) * (n / 2)} edges`,
      () => {
        planarizeDirectedMultipartite(multipartite, dag);
      },
      {
        iterations: 100,
        setup: () => {
          dag = new Layered([n / 2, n / 2]);

          multipartite = new OrderedMultipartite<MockNode>();
          [...dag.nodes].forEach((node, i) =>
            multipartite.set(node, i < n / 2 ? 0 : 1),
          );
        },
      },
    );
  });
});
