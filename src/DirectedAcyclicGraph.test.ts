import { describe, expect, test } from 'vitest';

import DirectedAcyclicGraph from './DirectedAcyclicGraph';
import { AntichainMock, ChainMock, CrownMock, LayeredMock } from './test/mocks';
import { areSetsEqual, getMockNode, getMockNodes } from './test/utils';
import { DirectedAcyclicGraphMock } from './test/mocks/DirectedAcyclicGraphMock';
import { MockNode } from './test';

/**
 * Testing is based on three untestable trivial methods `nodes`, `has` and `hasArc`.
 */
describe(' Directed Acyclic Graph', () => {
  const testCases = [
    { title: 'antichain', mock: new AntichainMock(100) },
    { title: 'chain', mock: new ChainMock(100) },
    { title: 'crown', mock: new CrownMock(100) },
    { title: 'layered', mock: new LayeredMock([10, 10, 10, 10, 10]) },
  ];

  describe('constructor from any DAG should work properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);

      /**
       * Created DAG should has all and only nodes specified by adjacency lists.
       */
      expect(areSetsEqual(dag.nodes, mock.nodes)).toBeTruthy();

      /**
       * Created DAG should has all and only edges specified by adjacency lists.
       */
      for (const tail of dag.nodes) {
        const children = mock.childrenOf(tail);
        for (const head of dag.nodes) {
          expect(dag.hasEdge(tail, head)).toBe(children.has(head));
        }
      }
    });
  });

  describe('copy constructor should work properly', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);
      const copy = DirectedAcyclicGraph.from(dag);

      /**
       * Created DAG should has all and only nodes specified by source DAG.
       */
      expect(areSetsEqual(copy.nodes, dag.nodes)).toBeTruthy();

      /**
       * Created DAG should has all and only edges specified by source DAG.
       */
      for (const tail of dag.nodes) {
        for (const head of dag.nodes) {
          expect(copy.hasEdge(tail, head)).toBe(dag.hasEdge(tail, head));
        }
      }

      /**
       * Changes should *not* affect source DAG.
       */
      const tail = getMockNode();
      const head = getMockNode();

      copy.add(tail);
      copy.add(head);
      copy.connect(tail, head);

      expect(areSetsEqual(new Set(dag.nodes), mock.nodes)).toBeTruthy();
      for (const tail of dag.nodes) {
        for (const head of dag.nodes) {
          expect(dag.hasEdge(tail, head)).toBe(mock.hasEdge(tail, head));
        }
      }
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
      expect(areSetsEqual(reversed.nodes, mock.nodes)).toBeTruthy();

      /**
       * Reverse should has all and only specified edges in reverse order.
       */
      for (const tail of dag.nodes) {
        for (const head of dag.nodes) {
          expect(reversed.hasEdge(head, tail)).toBe(dag.hasEdge(tail, head));
        }
      }
    });
  });

  describe('sorted should be correct', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const dag = DirectedAcyclicGraph.from(mock);
      const sorted = dag.sorted();

      /**
       * Array should have all and only source's nodes.
       */
      expect(areSetsEqual(new Set(sorted), dag.nodes)).toBeTruthy();

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
      dag.nodes.forEach((containedNode) => containedNode === node);
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
      expect(areSetsEqual(dag.nodes, source.nodes));
    });
  });

  describe('connecting nodes should works properly', () => {
    test('should connect unconnected nodes', () => {
      const dag = new DirectedAcyclicGraph();
      const tail = getMockNode();
      const head = getMockNode();

      /**
       * Method should notify that the edge has been created.
       */
      expect(dag.connect(tail, head)).toBeTruthy();

      /**
       * Only specified nodes should be added.
       */
      expect(areSetsEqual(dag.nodes, new Set([tail, head]))).toBeTruthy();

      /**
       * Only specified edge should be created.
       */
      expect(dag.hasEdge(tail, head)).toBeTruthy();
      for (const containedHead of dag.nodes) {
        for (const containedTail of dag.nodes) {
          if (containedHead !== head || containedTail !== tail) {
            expect(dag.hasEdge(containedTail, containedHead)).toBeFalsy();
          }
        }
      }
    });

    test('should *not* create an edge that already exists', () => {
      const source = new DirectedAcyclicGraph();
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
      expect(dag.hasEdge(tail, head)).toBeTruthy();
      for (const containedHead of dag.nodes) {
        for (const containedTail of dag.nodes) {
          if (containedHead !== head || containedTail !== tail) {
            expect(dag.hasEdge(containedTail, containedHead)).toBe(
              source.hasEdge(containedTail, containedHead),
            );
          }
        }
      }
    });
  });

  describe('disconnecting nodes should works properly', () => {
    test('should disconnect connected nodes', () => {
      const source = new DirectedAcyclicGraph();
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
      expect(dag.hasEdge(tail, head)).toBeFalsy();
      for (const containedHead of dag.nodes) {
        for (const containedTail of dag.nodes) {
          if (containedHead !== head || containedTail !== tail) {
            expect(dag.hasEdge(containedTail, containedHead)).toBeFalsy();
          }
        }
      }
    });

    test('should *not* delete an edge that does *not* exists', () => {
      const source = new DirectedAcyclicGraph();
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
      expect(dag.hasEdge(tail, head)).toBeFalsy();
      for (const containedHead of dag.nodes) {
        for (const containedTail of dag.nodes) {
          if (containedHead !== head || containedTail !== tail) {
            expect(dag.hasEdge(containedTail, containedHead)).toBe(
              source.hasEdge(containedTail, containedHead),
            );
          }
        }
      }
    });
  });

  describe('deleting node should works properly', () => {
    test('should delete contained node', () => {
      const source = new DirectedAcyclicGraph<MockNode>();
      const node = getMockNode();
      const tails = new Set(getMockNodes(100));
      const heads = new Set(getMockNodes(100));

      source.add(node);
      tails.forEach((tail) => source.add(tail));
      heads.forEach((head) => source.add(head));

      const dag = DirectedAcyclicGraph.from(source);

      /**
       * Method should notify that the node has been deleted.
       */
      expect(dag.delete(node)).toBeTruthy();

      /**
       * Only specified node should be deleted.
       */
      expect(dag.has(node)).toBeFalsy();
      expect(
        areSetsEqual(new Set([...dag.nodes, node]), source.nodes),
      ).toBeTruthy();

      /**
       * only connected edges should be deleted.
       */
      for (const containedHead of source.nodes) {
        for (const containedTail of source.nodes) {
          if (
            (containedTail === node && heads.has(containedHead)) ||
            (tails.has(containedTail) && containedHead === node)
          ) {
            expect(dag.hasEdge(containedTail, containedHead)).toBeFalsy();
          } else {
            expect(dag.hasEdge(containedTail, containedHead)).toBe(
              source.hasEdge(containedTail, containedHead),
            );
          }
        }
      }
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
      expect(areSetsEqual(dag.nodes, source.nodes)).toBeTruthy();
      for (const containedHead of source.nodes) {
        for (const containedTail of source.nodes) {
          expect(dag.hasEdge(containedTail, containedHead)).toBe(
            source.hasEdge(containedTail, containedHead),
          );
        }
      }
    });
  });

  test.skip("should correctly maintain DAG's invariants", () => {
    let mock: DirectedAcyclicGraphMock<MockNode>;
    const dag = DirectedAcyclicGraph.from(new AntichainMock(90));

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
