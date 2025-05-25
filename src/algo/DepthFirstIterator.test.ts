import { describe, expect, test } from 'vitest';
import {
  AntichainMock,
  ChainMock,
  CrownMock,
  LayeredMock,
} from '../test/mocks';
import { MockNode, areSetsEqual } from '../test';
import { DepthFirstIterator, IteratorInjectOn } from './DepthFirstIterator';
import { DirectedAcyclicGraph, EdgeAdditionStrategy } from '..';

describe('Depth First Iterator', () => {
  const testCases = [
    { title: 'antichain', mock: new AntichainMock(100) },
    { title: 'chain', mock: new ChainMock(100) },
    { title: 'crown', mock: new CrownMock(100) },
    { title: 'layered', mock: new LayeredMock([10, 10, 10, 10, 10]) },
  ];

  describe('should correctly inject', () => {
    describe.each([
      {
        when: 'on enter',
        injectOn: IteratorInjectOn.ENTER,
        isCorrect: (injectOn: IteratorInjectOn) =>
          injectOn === IteratorInjectOn.ENTER,
      },
      {
        when: 'on leave',
        injectOn: IteratorInjectOn.LEAVE,
        isCorrect: (injectOn: IteratorInjectOn) =>
          injectOn === IteratorInjectOn.LEAVE,
      },
      {
        when: 'for both',
        injectOn: IteratorInjectOn.ALL,
        isCorrect: (injectOn: IteratorInjectOn) =>
          injectOn === IteratorInjectOn.ENTER ||
          injectOn === IteratorInjectOn.LEAVE,
      },
    ])('should inject $when', ({ injectOn, isCorrect }) => {
      test.each(testCases)('$title', ({ mock }) => {
        for (const root of mock.nodes) {
          const iterator = new DepthFirstIterator(mock, root, {
            injectOn,
          });
          for (const [, details] of iterator) {
            expect(isCorrect(details.injectOn)).toBeTruthy();
          }
        }
      });
    });
  });

  describe('should correctly iterate', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const entered = new Set<MockNode>();
      const left = new Set<MockNode>();
      for (const root of mock.nodes) {
        entered.clear();
        left.clear();

        const iterator = new DepthFirstIterator(mock, root, {
          injectOn: IteratorInjectOn.ALL,
        });

        for (const [node, details] of iterator) {
          if (details.injectOn === IteratorInjectOn.ENTER) {
            /**
             * Nodes should not be repeated when iterating a valid DAG.
             */
            expect(entered.has(node)).toBeFalsy();
            entered.add(node);
          }
          if (details.injectOn === IteratorInjectOn.LEAVE) {
            /**
             * Nodes should not be repeated when iterating a valid DAG.
             */
            expect(left.has(node)).toBeFalsy();

            /**
             * Nodes must firstly be markered as entered.
             */
            expect(entered.has(node)).toBeTruthy();

            /**
             * Each decendant of the `node` should be visited before leaving.
             */
            mock
              .descendantsOf(node, Infinity)
              .forEach((descendant) =>
                expect(left.has(descendant)).toBeTruthy(),
              );

            left.add(node);
          }
        }
      }
    });
  });

  describe("should correctly return node's depth", () => {
    test.each(testCases)('$title', ({ mock }) => {
      for (const root of mock.nodes) {
        const iterator = new DepthFirstIterator(mock, root, {
          injectOn: IteratorInjectOn.ALL,
        });

        for (const [node, details] of iterator) {
          /**
           * The `node` should be a descendant of the `root` no deeper than `details.depth`.
           */
          expect(
            new Set(mock.descendantsOf(root, details.depth))
              .add(root)
              .has(node),
          ).toBeTruthy();
        }
      }
    });
  });

  describe('should correctly ignore nodes', () => {
    test.each(testCases)('$title', ({ mock }) => {
      const ignore = new Set(
        [...mock.nodes].filter((_, index) => index % 5 === 0),
      );
      const visited = new Set<MockNode>();
      for (const root of mock.nodes) {
        visited.clear();

        const iterator = new DepthFirstIterator(mock, root, {
          ignore,
        });

        for (const [node] of iterator) visited.add(node);

        for (const ignoringNode of ignore) {
          expect(visited.has(ignoringNode)).toBeFalsy();
        }
      }
    });
  });

  describe('should correctly limit iteration depth', () => {
    describe('should correctly iterate with depth limited by negative number', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const visited = new Set<MockNode>();
        for (const root of mock.nodes) {
          visited.clear();
          const iterator = new DepthFirstIterator(mock, root, {
            depth: -0.0001,
            injectOn: IteratorInjectOn.ALL,
          });

          for (const [node] of iterator) {
            visited.add(node);
          }

          /**
           * Iterator should not visit any node
           */
          expect(visited.size).toBe(0);
        }
      });
    });

    describe('should correctly iterate with depth limited by non-negative integer', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const visited = new Set<MockNode>();
        for (const root of mock.nodes) {
          for (let maxDepth = 0; maxDepth < mock.size.depth; ++maxDepth) {
            visited.clear();

            const iterator = new DepthFirstIterator(mock, root, {
              depth: maxDepth,
              injectOn: IteratorInjectOn.ALL,
            });

            for (const [node] of iterator) {
              visited.add(node);
            }

            /**
             * Iterator should visit all and only descendants no deeper than `maxDepth`.
             */
            expect(
              areSetsEqual(
                visited,
                new Set(mock.descendantsOf(root, maxDepth)).add(root),
              ),
            ).toBeTruthy();
          }
        }
      });
    });

    describe('should correctly iterate with depth limited by non-negative float', () => {
      test.each(testCases)('$title', ({ mock }) => {
        const visited = new Set<MockNode>();
        for (const root of mock.nodes) {
          for (let maxDepth = 0; maxDepth < mock.size.depth; ++maxDepth) {
            visited.clear();
            const iterator = new DepthFirstIterator(mock, root, {
              depth: maxDepth + 0.9999,
              injectOn: IteratorInjectOn.ALL,
            });

            for (const [node] of iterator) {
              visited.add(node);
            }

            expect(
              areSetsEqual(
                visited,
                new Set(mock.descendantsOf(root, maxDepth)).add(root),
              ),
            ).toBeTruthy();
          }
        }
      });
    });
  });

  test('should throw CycleProhibitedException when a cycle is found', () => {
    const dag = DirectedAcyclicGraph.from<MockNode>(new ChainMock(10), {
      edgeAdditionStrategy: EdgeAdditionStrategy.UNSAFE,
    });
    const nodes = [...dag.nodes];
    dag.connect(nodes[nodes.length - 1], nodes[0]);

    const iterator = new DepthFirstIterator(dag, nodes[0]);

    expect(() => [...iterator]).toThrowError(
      /^Cycle found when traversing depth-first iterator$/,
    );
  });
});
