import { describe, expect, test } from 'vitest';
import {
  AntichainMock,
  ChainMock,
  CrownMock,
  LayeredMock,
} from '../test/mocks';
import { BreadthFirstIterator } from './BreadthFirstIterator';
import { MockNode, areSetsEqual } from '../test';

describe('Breadth First Iterator', () => {
  const testCases = [
    { title: 'antichain', mock: new AntichainMock(100) },
    { title: 'chain', mock: new ChainMock(100) },
    { title: 'crown', mock: new CrownMock(100) },
    { title: 'layered', mock: new LayeredMock([10, 10, 10, 10, 10]) },
  ];

  describe('should correctly iterate layer by layer', () => {
    test.each(testCases)('$title', ({ mock }) => {
      let depth: number;
      const visited = new Set<MockNode>();
      for (const root of mock.nodes) {
        depth = 0;
        visited.clear();
        const iterator = new BreadthFirstIterator(mock, root);
        for (const [node, details] of iterator) {
          /**
           * Nodes should not be repeated when iterating a valid DAG
           */
          expect(visited.has(node)).toBeFalsy();

          /**
           * Node depth should *not* decrease.
           * */
          expect(details.depth >= depth).toBeTruthy();

          if (details.depth > depth) {
            /**
             * When the iterator increases depth all descendants
             * of the root at the previous depth should be visited.
             */
            expect(
              areSetsEqual(
                visited,
                new Set(mock.descendantsOf(root, depth)).add(root),
              ),
            ).toBeTruthy();
            depth = details.depth;
          }

          visited.add(node);
        }
      }
    });
  });

  describe("should correctly return node's depth", () => {
    test.each(testCases)('$title', ({ mock }) => {
      for (const root of mock.nodes) {
        const iterator = new BreadthFirstIterator(mock, root);
        for (const [node, details] of iterator) {
          if (node === root) {
            expect(details.depth).toBe(0);
            continue;
          }

          /**
           * The `node` should be descendant of the `root` at the `details.depth` ...
           */
          expect(
            mock.descendantsOf(root, details.depth).has(node),
          ).toBeTruthy();
          /**
           * ... but not at the depth `details.depth - 1`.
           */
          expect(
            mock.descendantsOf(root, details.depth - 1).has(node),
          ).toBeFalsy();
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

        const iterator = new BreadthFirstIterator(mock, root, {
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
          const iterator = new BreadthFirstIterator(mock, root, {
            depth: -0.0001,
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
            const iterator = new BreadthFirstIterator(mock, root, {
              depth: maxDepth,
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
            const iterator = new BreadthFirstIterator(mock, root, {
              depth: maxDepth + 0.9999,
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
});
