import { describe, expect, test } from 'vitest';
import { areSetsEqual, getMockNode, getMockNodes, MockNode } from './test';
import { Partition } from './Partition';

describe('constructor', () => {
  test('should add all and only specified nodes', () => {
    const parts = [getMockNodes(10), getMockNodes(10), getMockNodes(10)];
    const nodes = new Set([...parts[0], ...parts[1], ...parts[2]]);

    const partition = new Partition<MockNode>(parts);

    expect(partition.size.nodes).toBe(30);
    expect(partition.size.parts).toBe(3);

    expect(areSetsEqual(new Set(partition.nodes()), nodes)).toBeTruthy();

    for (const node of partition.nodes()) {
      expect(partition.has(node)).toBeTruthy();
    }

    for (const p of parts) {
      const part = partition.get(p[0])!;

      expect(part).not.toBe(undefined);
      expect(partition.has(part)).toBeTruthy();
      expect(areSetsEqual(part, new Set(p))).toBeTruthy();
    }
  });
});

describe('move', () => {
  test('should move node to another part', () => {
    const parts = [getMockNodes(10), getMockNodes(10)];
    const nodeToBeMoved = parts[0][5];

    const partition = new Partition<MockNode>(parts);
    const destinationPart = partition.get(parts[1][0])!;

    expect(partition.move(nodeToBeMoved, destinationPart)).toBeTruthy();

    expect(partition.size.parts).toBe(2);
    expect(partition.size.nodes).toBe(20);
    expect(partition.has(nodeToBeMoved)).toBeTruthy();
    expect(partition.get(nodeToBeMoved)).toBe(destinationPart);
  });

  test('should create new part if empty set passed', () => {
    const parts = [getMockNodes(10)];
    const nodeToBeMoved = parts[0][5];

    const partition = new Partition<MockNode>(parts);

    const oldParts = new Set(partition.parts());

    partition.move(nodeToBeMoved, new Set());

    const newParts = new Set(partition.parts());

    const diff = new Set();
    for (const part of oldParts) if (!newParts.has(part)) diff.add(part);
    for (const part of newParts) if (!oldParts.has(part)) diff.add(part);

    expect(diff.size).toBe(1);
    expect(partition.size.parts).toBe(2);
    expect(partition.size.nodes).toBe(10);
    expect(partition.has(nodeToBeMoved)).toBeTruthy();
    expect(partition.get(nodeToBeMoved)).toBe(diff.values().next().value!);
  });
});

describe('guarantees', () => {
  test('should ignore new nodes', () => {
    const parts = [getMockNodes(10), getMockNodes(10)];

    const partition = new Partition<MockNode>(parts);
    const destinationPart = partition.get(parts[1][0])!;

    expect(partition.get(getMockNode())).toBe(undefined);
    expect(partition.move(getMockNode(), new Set())).toBeFalsy();
    expect(partition.move(getMockNode(), destinationPart)).toBeFalsy();
  });

  test('should delete part if there is no one node in it', () => {
    const parts = [getMockNodes(1), getMockNodes(10)];
    const nodeToBeMoved = parts[0][0];

    const partition = new Partition<MockNode>(parts);
    const basePart = partition.get(parts[0][0])!;
    const destinationPart = partition.get(parts[1][0])!;

    partition.move(nodeToBeMoved, destinationPart);

    expect(partition.size.parts).toBe(1);
    expect(partition.size.nodes).toBe(11);
    expect(partition.has(basePart)).toBeFalsy();
    expect(partition.has(nodeToBeMoved)).toBeTruthy();
    expect(partition.get(nodeToBeMoved)!).toBe(destinationPart);
  });
});
