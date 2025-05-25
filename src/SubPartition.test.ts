import { test, describe, expect } from 'vitest';

import { areSetsEqual, getMockNode, getMockNodes } from './test';
import { SubPartition } from './SubPartition';
import {
  InvalidSubPartitioningError,
  UnmatchedSubPartitionError,
} from './exeptions';

describe('constructor', () => {
  test('should correctly create valid subpartition', () => {
    const superpartition = [getMockNodes(10), getMockNodes(10)];
    const nodes = [...superpartition[0], ...superpartition[1]];
    const subpartition = nodes.map((node) => [node]);

    const partition = new SubPartition(subpartition, superpartition);

    expect(partition.parent.size.parts).toBe(superpartition.length);
    expect(partition.parent.size.nodes).toBe(nodes.length);

    for (const _superpart of superpartition) {
      const superpart = partition.parent.get(_superpart[0])!;

      expect(areSetsEqual(superpart, new Set(_superpart))).toBeTruthy();
      expect(partition.subparts(superpart).size).toBe(10);

      for (const node of _superpart) {
        expect(partition.superpart(node)).toBe(superpart);
      }

      for (const _subpart of subpartition) {
        const subpart = partition.get(_subpart[0])!;

        if (superpart.has(_subpart[0])) {
          expect(partition.superpart(subpart)).toBe(superpart);
          expect(partition.subparts(superpart).has(subpart));
        }
      }
    }
  });

  test('should ensure that subpartition contains all and only nodes of the parent partition', () => {
    const diffNode = getMockNode();
    const part1 = getMockNodes(10);
    const part2 = getMockNodes(10);

    const superpartition = [[...part1, diffNode], [...part2]];
    const incompleteSubpartition = [[...part1], [...part2]];

    expect(() => {
      new SubPartition(incompleteSubpartition, superpartition);
    }).toThrowError(UnmatchedSubPartitionError);

    const overflowedSubpartition = [
      [...part1, diffNode, getMockNode()],
      [...part2],
    ];

    expect(() => {
      new SubPartition(overflowedSubpartition, superpartition);
    }).toThrowError(UnmatchedSubPartitionError);
  });

  test('should prevent the creation of an incorrect subpartiton', () => {
    const incorrectNode = getMockNode();
    const part1 = getMockNodes(10);
    const part2 = getMockNodes(10);

    const superpartition = [[...part1, incorrectNode], [...part2]];
    const incorrectSubpartition = [[...part1], [...part2, incorrectNode]];

    expect(() => {
      new SubPartition(incorrectSubpartition, superpartition);
    }).toThrowError(InvalidSubPartitioningError);
  });
});

describe('move', () => {
  test('should prevent movement that makes subpartition invalid', () => {
    let node;
    const superpartition = [
      [...getMockNodes(9), (node = getMockNode())],
      getMockNodes(10),
    ];

    const partition = new SubPartition(superpartition, superpartition);
    const destinationPart = partition.get(superpartition[1][0])!;

    expect(partition.move(node, destinationPart)).toBeFalsy();
  });

  test('should delete part from the set of subparts if it is empty', () => {
    const superpartition = [getMockNodes(10), getMockNodes(10)];
    const nodes = [...superpartition[0], ...superpartition[1]];
    const subpartition = nodes.map((node) => [node]);

    const partition = new SubPartition(subpartition, superpartition);

    const nodeToBeMoved = nodes[0];
    const basePart = partition.get(nodeToBeMoved)!;
    const destPart = partition.get(nodes[1])!;

    const subparts = partition.subparts(partition.parent.get(nodeToBeMoved)!);

    expect(subparts.has(basePart)).toBeTruthy();

    partition.move(nodeToBeMoved, destPart);

    expect(subparts.has(basePart)).toBeFalsy();
  });
});
