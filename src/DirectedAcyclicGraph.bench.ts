import { Bench } from 'tinybench';
import { bench, describe } from 'vitest';

import { AbstractDirectedAcyclicGraph } from './models';
import { EdgeAdditionStrategy } from './DirectedAcyclicGraph';

import { Chain, getMockNode, Layered, MockNode } from 'src/test';

const sizes = [
  100, 300, 500, 700, 1_000, 3_000, 5_000, 7_000, 10_000, 15_000, 25_000,
];
const mutationSizes = [100, 300, 500, 700, 1_000, 3_000, 5_000];

describe('has node', () => {
  sizes
    .map((size) => {
      const dag = new Chain(size);
      return { dag, node: [...dag.nodes][Math.floor(Math.random() * size)] };
    })
    .forEach(({ dag, node }) => {
      bench(
        `${dag.size.nodes} nodes; ${dag.size.edges} edges`,
        () => {
          dag.has(node);
        },
        { time: 0, iterations: 10000 },
      );
    });
});

describe('has edge', () => {
  sizes
    .map((size) => {
      const dag = new Chain(size);
      const nodes = [...dag.nodes];
      return {
        dag,
        tail: nodes[Math.floor(Math.random() * size)],
        head: nodes[Math.floor(Math.random() * size)],
      };
    })
    .forEach(({ dag, tail, head }) => {
      bench(
        `${dag.size.nodes} nodes; ${dag.size.edges} edges`,
        () => {
          dag.hasEdge(tail, head);
        },
        { time: 0, iterations: 10000 },
      );
    });
});

describe('parents of node', () => {
  sizes
    .map((size) => {
      const dag = new Layered([size - 1, 1]);
      return { dag, node: [...dag.nodes][0] };
    })
    .forEach(({ dag, node }) => {
      bench(
        `${dag.size.nodes} nodes; ${dag.size.edges} edges`,
        () => {
          dag.parentsOf(node);
        },
        { time: 0, iterations: 10000 },
      );
    });
});

describe('children of node', () => {
  sizes
    .map((size) => {
      const dag = new Layered([1, size - 1]);
      const nodes = [...dag.nodes];
      return { dag, node: nodes[nodes.length - 1] };
    })
    .forEach(({ dag, node }) => {
      bench(
        `${dag.size.nodes} nodes; ${dag.size.edges} edges`,
        () => {
          dag.childrenOf(node);
        },
        { time: 0, iterations: 10000 },
      );
    });
});

// TODO: rewrite mutation benchmarks after closing vitest issue
// https://github.com/vitest-dev/vitest/issues/7599

await (async () => {
  const bench = new Bench({
    warmupTime: 0,
    time: 0,
    iterations: 1000,
  });

  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  mutationSizes.forEach((size) => {
    bench.add(
      `add node, ${size} nodes + ${size - 1} edges`,
      () => {
        dag!.add(getMockNode());
      },
      {
        beforeEach: () => {
          dag = new Chain(size);
        },
      },
    );
  });

  await bench.run();
  console.table(bench.table());
})();

await (async () => {
  const bench = new Bench({
    warmupTime: 0,
    time: 0,
    iterations: 1000,
  });

  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  let node: MockNode;
  mutationSizes.forEach((size) => {
    bench.add(
      `delete node, parents + children = ${size}`,
      () => {
        dag!.delete(node!);
      },
      {
        beforeEach: () => {
          dag = new Layered([size / 2, 1, size / 2]);
          for (const n of dag.nodes) {
            if (dag.childrenOf(n).size === size / 2) {
              node = n;
              break;
            }
          }
        },
      },
    );
  });

  await bench.run();
  console.table(bench.table());
})();

await (async () => {
  for (const strategy of [
    EdgeAdditionStrategy.SAFE,
    EdgeAdditionStrategy.UNSAFE,
  ]) {
    const bench = new Bench({
      warmupTime: 0,
      time: 0,
      iterations: 1000,
    });

    let dag: AbstractDirectedAcyclicGraph<MockNode>;
    let tail: MockNode;
    let head: MockNode;
    mutationSizes.forEach((size) => {
      bench.add(
        `connect nodes (${strategy}), ${size} nodes + ${size - 1} edges in children subtree`,
        () => {
          dag!.connect(tail!, head!);
        },
        {
          beforeEach: () => {
            dag = new Layered([1, size - 1], {
              edgeAdditionStrategy: strategy,
            });
            dag.add((tail = getMockNode()));
            head = dag.nodes.next().value!;
          },
        },
      );
    });

    await bench.run();
    console.table(bench.table());
  }
})();

await (async () => {
  const bench = new Bench({
    warmupTime: 0,
    time: 0,
    iterations: 1000,
  });

  let dag: AbstractDirectedAcyclicGraph<MockNode>;
  let tail: MockNode;
  let head: MockNode;
  mutationSizes.forEach((size) => {
    bench.add(
      `disconnect nodes, ${size} nodes + ${size - 1} edges`,
      () => {
        dag!.disconnect(tail!, head!);
      },
      {
        beforeEach: () => {
          dag = new Chain(size);
          const nodes = [...dag.nodes];
          tail = nodes[Math.ceil(Math.random() * nodes.length)];
          head = nodes[Math.ceil(Math.random() * nodes.length)];
        },
      },
    );
  });

  await bench.run();
  console.table(bench.table());
})();
