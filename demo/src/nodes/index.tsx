import { DeletableNode } from './DeletableNode';
import { AnyFirstIteratorNode } from './AnyFirstIteratorNode';
import { PartitionNode } from './PartitionNode';

export enum Shape {
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
}

export const nodeTypes = {
  Deletable: DeletableNode,
  AnyFirstIterator: AnyFirstIteratorNode,
  Partition: PartitionNode,
};

export const nodeShapes: Record<string, Shape> = {
  Deletable: Shape.CIRCLE,
  AnyFirstIterator: Shape.CIRCLE,
  Partition: Shape.RECTANGLE,
};

export * from './AnyFirstIteratorNode';
export * from './DeletableNode';
export * from './PartitionNode';
