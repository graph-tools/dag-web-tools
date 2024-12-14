import { describe, expect, test } from 'vitest';
import {
  AntichainMock,
  ChainMock,
  CrownMock,
  LayeredMock,
} from '../test/mocks';
import {
  getEquivalentNodesByParents,
  getEquivalentNodesByChildren,
  getEquivalentNodes,
} from './getEquivalentNodes';
import { ReadonlyDirectedAcyclicGraph } from '../models';
import { areSetsEqual } from '../test';

function isEqualByParent<Node>(
  a: Node,
  b: Node,
  dag: ReadonlyDirectedAcyclicGraph<Node>,
  subset: Set<Node>,
): boolean {
  return areSetsEqual(
    new Set([...dag.parentsOf(a)].filter((node) => subset.has(node))),
    new Set([...dag.parentsOf(b)].filter((node) => subset.has(node))),
  );
}

function isEqualByChildren<Node>(
  a: Node,
  b: Node,
  dag: ReadonlyDirectedAcyclicGraph<Node>,
  subset: Set<Node>,
): boolean {
  return areSetsEqual(
    new Set([...dag.childrenOf(a)].filter((node) => subset.has(node))),
    new Set([...dag.childrenOf(b)].filter((node) => subset.has(node))),
  );
}

describe('Quotient Set', () => {
  const testCases = [
    { title: 'antichain', mock: new AntichainMock(10) },
    { title: 'chain', mock: new ChainMock(10) },
    { title: 'crown', mock: new CrownMock(5) },
    { title: 'layered', mock: new LayeredMock([2, 2, 2, 2, 2]) },
  ];

  describe('should correctly get quotient set of any node subset', () => {
    describe.each([
      {
        by: 'parent',
        isEqual: isEqualByParent,
        getProjection: getEquivalentNodesByParents,
      },
      {
        by: 'children',
        isEqual: isEqualByChildren,
        getProjection: getEquivalentNodesByChildren,
      },
      {
        by: '{parent, children}',
        isEqual: (...args) =>
          isEqualByParent(...args) && isEqualByChildren(...args),
        getProjection: getEquivalentNodes,
      },
    ])('by $by', ({ getProjection, isEqual }) => {
      test.each(testCases)('$title', ({ mock }) => {
        const nodes = [...mock];
        for (let size = 0; size < 2 ** nodes.length - 1; ++size) {
          const subset = new Set(
            nodes.filter((_, index) => (2 ** index) & size),
          );
          const projection = getProjection(mock, subset);

          for (const node of subset) {
            /**
             * All and only nodes in subset should be classified.
             */
            expect(
              subset.has(node) === (projection.has(node) !== undefined),
            ).toBeTruthy();
          }

          for (const a of subset) {
            for (const b of subset) {
              /**
               * Equivalent nodes must be in the same equivalence class.
               */
              expect(
                isEqual(a, b, mock, subset) ===
                  (projection.get(a) === projection.get(b)),
              ).toBeTruthy();
            }
          }
        }
      });
    });
  });
});
