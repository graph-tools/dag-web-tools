import { describe, expect, test } from 'vitest';

import { DirectedAcyclicGraphEdgeArgs } from '.';
import {
  DirectedAcyclicGraph,
  EdgeAdditionStrategy,
} from './DirectedAcyclicGraph';

import {
  DirectedAcyclicGraphMock,
  AntichainMock,
  ChainMock,
  CrownMock,
  LayeredMock,
  MockEdge,
  MockNode,
  areMultisetsEqual,
  getMockEdge,
  areSetsEqual,
  getMockNode,
  getMockNodes,
} from './test';

function edgesEqual<Node, Edge>(
  [tailA, headA, edgeA]: DirectedAcyclicGraphEdgeArgs<Node, Edge>,
  [tailB, headB, edgeB]: DirectedAcyclicGraphEdgeArgs<Node, Edge>,
): boolean {
  return tailA === tailB && headA === headB && edgeA === edgeB;
}

/**
 * Testing is based on three untestable trivial methods `nodes`, `has` and `hasArc`.
 */
describe('Directed Acyclic Graph', () => {
  const testCases = [
    { title: 'antichain', mock: new AntichainMock(100) },
    { title: 'chain', mock: new ChainMock(100) },
    { title: 'crown', mock: new CrownMock(100) },
    { title: 'layered', mock: new LayeredMock([10, 10, 10, 10, 10]) },
  ];

  describe('edges iterator should work properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      /**
       * Created DAG should has all and only edges specified by mock.
       */
      expect(
        areMultisetsEqual([...dag.edges], [...mock.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });
  });

  describe('constructor from any DAG should work properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      /**
       * Created DAG should has all and only nodes specified by adjacency lists.
       */
      expect(areMultisetsEqual([...dag.nodes], [...mock.nodes])).toBeTruthy();

      /**
       * Created DAG should has all and only edges specified by adjacency lists.
       */
      expect(
        areMultisetsEqual([...dag.edges], [...mock.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });
  });

  describe('copy constructor should work properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);
      const copy = DirectedAcyclicGraph.from(dag);

      /**
       * Created DAG should has all and only nodes specified by source DAG.
       */
      expect(areMultisetsEqual([...copy.nodes], [...dag.nodes])).toBeTruthy();

      /**
       * Created DAG should has all and only edges specified by source DAG.
       */
      expect(
        areMultisetsEqual([...copy.edges], [...dag.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();

      /**
       * Changes should *not* affect source DAG.
       */
      const tail = getMockNode();
      const head = getMockNode();

      copy.add(tail);
      copy.add(head);
      copy.connect(tail, head, getMockEdge());

      expect(areMultisetsEqual([...dag.nodes], [...mock.nodes])).toBeTruthy();
      expect(
        areMultisetsEqual([...dag.edges], [...mock.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });
  });

  describe('size of DAG should be correct', () => {
    describe('the number of nodes should be correct', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const dag = DirectedAcyclicGraph.from(mock);
        expect(dag.size.nodes).toBe(mock.size.nodes);
      });
    });

    describe('the number of edges should be correct', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const dag = DirectedAcyclicGraph.from(mock);
        expect(dag.size.edges).toBe(mock.size.edges);
      });
    });

    describe('depth should be correct', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const dag = DirectedAcyclicGraph.from(mock);
        expect(dag.size.depth).toBe(mock.size.depth);
      });
    });

    describe.skip('width should be correct', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const dag = DirectedAcyclicGraph.from(mock);
        expect(dag.size.width).toBe(mock.size.width);
      });
    });
  });

  describe('hasPathBetween should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      for (const tail of dag.nodes) {
        for (const head of dag.nodes) {
          for (let depth = 0; depth <= dag.size.depth; ++depth) {
            /**
             * Method should correctly check.
             */
            expect(dag.hasPathBetween(tail, head, depth)).toBe(
              mock.hasPathBetween(tail, head, depth),
            );

            /**
             * Method should works correctly with float depth.
             */
            expect(dag.hasPathBetween(tail, head, depth + 0.9999)).toBe(
              mock.hasPathBetween(tail, head, depth),
            );
          }
        }
      }
    });
  });

  describe('descendantsOf should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      for (const node of dag.nodes) {
        for (let depth = 0; depth <= dag.size.depth; ++depth) {
          /**
           * Descendants should be correct.
           */
          expect(
            areSetsEqual(
              dag.descendantsOf(node, depth),
              mock.descendantsOf(node, depth),
            ),
          ).toBeTruthy();

          /**
           * Method should works correctly with float depth.
           */
          expect(
            areSetsEqual(
              dag.descendantsOf(node, depth + 0.9999),
              mock.descendantsOf(node, depth),
            ),
          ).toBeTruthy();
        }
      }
    });
  });

  describe('ancestorsOf should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      for (const node of dag.nodes) {
        for (let depth = 0; depth <= dag.size.depth; ++depth) {
          /**
           * Ancestors should be correct.
           */
          expect(
            areSetsEqual(
              dag.ancestorsOf(node, depth),
              mock.ancestorsOf(node, depth),
            ),
          ).toBeTruthy();

          /**
           * Method should works correctly with float depth.
           */
          expect(
            areSetsEqual(
              dag.ancestorsOf(node, depth + 0.9999),
              mock.ancestorsOf(node, depth),
            ),
          ).toBeTruthy();
        }
      }
    });
  });

  describe('childrenOf should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      for (const node of dag.nodes) {
        expect(
          areSetsEqual(dag.childrenOf(node), mock.childrenOf(node)),
        ).toBeTruthy();
      }
    });
  });

  describe('parentsOf should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      for (const node of dag.nodes) {
        expect(
          areSetsEqual(dag.parentsOf(node), mock.parentsOf(node)),
        ).toBeTruthy();
      }
    });
  });

  describe('reversed should works properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);
      const reversed = dag.reversed();

      /**
       * Reverse should has all and only nodes specified by source DAG.
       */
      expect(
        areMultisetsEqual([...reversed.nodes], [...mock.nodes]),
      ).toBeTruthy();

      /**
       * Reverse should has all and only specified edges in reverse order.
       */
      expect(
        areMultisetsEqual(
          [...reversed.edges],
          [...mock.edges].map<DirectedAcyclicGraphEdgeArgs<MockNode, MockEdge>>(
            ([tail, head, edge]) => [head, tail, edge],
          ),
          {
            equal: edgesEqual,
          },
        ),
      ).toBeTruthy();
    });
  });

  describe('sorted should be correct', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);
      const sorted = dag.sorted();

      /**
       * Array should have all and only source's nodes.
       */
      expect(areMultisetsEqual(sorted, [...dag.nodes])).toBeTruthy();

      /**
       * Array should be correct topological sort.
       */
      for (let i = sorted.length - 1; i >= 0; --i) {
        for (let j = 0; j < i; ++j) {
          expect(dag.hasPathBetween(sorted[i], sorted[j])).toBeFalsy();
        }
      }
    });
  });

  describe('adding a node should works properly', () => {
    test('should add new node', () => {
      const dag = new DirectedAcyclicGraph();
      const node = getMockNode();

      /**
       * Method should notify that the node has been added.
       */
      expect(dag.add(node)).toBeTruthy();

      /**
       * Only specified node should be added.
       */
      expect(dag.has(node)).toBeTruthy();
      [...dag.nodes].forEach((containedNode) => containedNode === node);
    });

    test('should *not* add a node that already contains', () => {
      const source = new DirectedAcyclicGraph();
      const node = getMockNode();
      source.add(node);

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the node has *not* been added.
       */
      expect(dag.add(node)).toBeFalsy();

      /**
       * Nothing should change.
       */
      expect(areMultisetsEqual([...dag.nodes], [...source.nodes]));
    });
  });

  describe('connecting nodes should works properly', () => {
    test('should connect unconnected nodes', () => {
      const dag = new DirectedAcyclicGraph<MockNode, MockEdge>();
      const copy = DirectedAcyclicGraph.from(dag);
      const tail = getMockNode();
      const head = getMockNode();
      const edge = getMockEdge();

      /**
       * Method should notify that the edge has been created.
       */
      expect(dag.connect(tail, head, edge)).toBeTruthy();

      /**
       * Only specified nodes should be added.
       */
      expect(areMultisetsEqual([...dag.nodes], [tail, head])).toBeTruthy();

      const newEdge: DirectedAcyclicGraphEdgeArgs<MockNode, MockEdge> = [
        tail,
        head,
        edge,
      ];
      /**
       * Only specified edge should be created.
       */
      expect(
        areMultisetsEqual([...dag.edges], [newEdge, ...copy.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });

    test('should *not* create an edge that already exists', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const tail = getMockNode();
      const head = getMockNode();
      source.connect(tail, head);

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the edge has *not* been created.
       */
      expect(dag.connect(tail, head)).toBeFalsy();

      /**
       * Nothing should change.
       */
      expect(
        areMultisetsEqual([...dag.edges], [...source.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });

    test('should throw CycleProhibitedException when creating loop (SAFE)', () => {
      const dag = DirectedAcyclicGraph.from<MockNode>(new ChainMock(10), {
        edgeAdditionStrategy: EdgeAdditionStrategy.SAFE,
      });
      const nodes = [...dag.nodes];

      /**
       * No self-connections in SAFE mode.
       */
      expect(() => dag.connect(nodes[0], nodes[0])).toThrowError(
        /^Adding a designated edge .* forms a loop$/,
      );

      /**
       * No loops in SAFE mode.
       */
      expect(() => dag.connect(nodes[nodes.length - 1], nodes[0])).toThrowError(
        /^Adding a designated edge .* forms a loop$/,
      );
    });

    test('should *not* throw CycleProhibitedException when creating loop (UNSAFE)', () => {
      const dag = DirectedAcyclicGraph.from<MockNode>(new ChainMock(10), {
        edgeAdditionStrategy: EdgeAdditionStrategy.UNSAFE,
      });
      const nodes = [...dag.nodes];

      /**
       * Self-connections are allowed in UNSAFE mode.
       */
      expect(() => dag.connect(nodes[0], nodes[0])).not.toThrowError(
        /^Adding a designated edge .* forms a loop$/,
      );

      /**
       * Loops are allowed in UNSAFE mode.
       */
      expect(() =>
        dag.connect(nodes[nodes.length - 1], nodes[0]),
      ).not.toThrowError(/^Adding a designated edge .* forms a loop$/);
    });
  });

  describe('disconnecting nodes should works properly', () => {
    test('should disconnect connected nodes', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const tail = getMockNode();
      const head = getMockNode();
      source.connect(tail, head);

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the edge has been deleted.
       */
      expect(dag.disconnect(tail, head)).toBeTruthy();

      /**
       * Only specified edge should be deleted.
       */
      expect(
        areMultisetsEqual(
          [...dag.edges],
          [...source.edges].filter((edge) => !edgesEqual(edge, [tail, head])),
          { equal: edgesEqual },
        ),
      ).toBeTruthy();
    });

    test('should *not* delete an edge that does *not* exists', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const tail = getMockNode();
      const head = getMockNode();

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the edge has *not* been deleted.
       */
      expect(dag.disconnect(tail, head)).toBeFalsy();

      /**
       * Nothing should change.
       */
      expect(
        areMultisetsEqual([...dag.edges], [...source.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });
  });

  describe('deleting node should works properly', () => {
    test('should delete contained node', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const node = getMockNode();
      const tails = new Set(getMockNodes(100));
      const heads = new Set(getMockNodes(100));

      source.add(node);
      tails.forEach((tail) => source.connect(tail, node));
      heads.forEach((head) => source.connect(node, head));

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the node has been deleted.
       */
      expect(dag.delete(node)).toBeTruthy();

      /**
       * Only specified node should be deleted.
       */
      expect(
        areMultisetsEqual(
          [...dag.nodes],
          [...source.nodes].filter((sourceNode) => sourceNode !== node),
        ),
      ).toBeTruthy();

      /**
       * only connected edges should be deleted.
       */
      expect(
        areMultisetsEqual(
          [...dag.edges],
          [...source.edges].filter(
            ([tail, head]) => tail !== node && head !== node,
          ),
          { equal: edgesEqual },
        ),
      ).toBeTruthy();
    });

    test('should *not* delete non-contained node', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const tails = new Set(getMockNodes(100));
      const heads = new Set(getMockNodes(100));

      tails.forEach((tail) => source.add(tail));
      heads.forEach((head) => source.add(head));

      const dag = DirectedAcyclicGraph.from(source);
      const node = getMockNode();

      /**
       * Method should notify that the node has been deleted.
       */
      expect(dag.delete(node)).toBeFalsy();

      /**
       * Nothing should change.
       */
      expect(areMultisetsEqual([...dag.nodes], [...source.nodes])).toBeTruthy();
      expect(
        areMultisetsEqual([...dag.edges], [...source.edges], {
          equal: edgesEqual,
        }),
      ).toBeTruthy();
    });
  });

  test.skip("should correctly maintain DAG's invariants", () => {
    let mock: DirectedAcyclicGraphMock<MockNode, MockEdge>;
    const dag = DirectedAcyclicGraph.from<MockNode>(new AntichainMock(90));

    const nodes = getMockNodes(10);
    nodes.forEach((node) => dag.add(node));

    /**
     * Invariants should be correct after adding separated nodes.
     */
    mock = new AntichainMock(100);
    expect(dag.size.nodes).toBe(mock.size.nodes);
    expect(dag.size.edges).toBe(mock.size.edges);
    expect(dag.size.width).toBe(mock.size.width);
    expect(dag.size.depth).toBe(mock.size.depth);

    let previous: MockNode | undefined;
    for (const node of dag.nodes) {
      if (previous) {
        dag.connect(previous, node);
      }
      previous = node;
    }

    /**
     * Invariants should be correct after creating chain.
     */
    mock = new ChainMock(100);
    expect(dag.size.nodes).toBe(mock.size.nodes);
    expect(dag.size.edges).toBe(mock.size.edges);
    expect(dag.size.width).toBe(mock.size.width);
    expect(dag.size.depth).toBe(mock.size.depth);

    dag.delete(nodes[nodes.length - 1]);

    /**
     * Invariants should be correct after deleting node.
     */
    mock = new ChainMock(99);
    expect(dag.size.nodes).toBe(mock.size.nodes);
    expect(dag.size.edges).toBe(mock.size.edges);
    expect(dag.size.width).toBe(mock.size.width);
    expect(dag.size.depth).toBe(mock.size.depth);
  });
});
