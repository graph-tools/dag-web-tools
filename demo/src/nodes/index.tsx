import { DeletableNode } from './DeletableNode';
import { AnyFirstIteratorNode } from './AnyFirstIteratorNode';
import { PartitionNode } from './PartitionNode';
import { ClassifiedNode } from './ClassifiedNode';

export enum Shape {
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
}

export const nodeTypes = {
  AnyFirstIterator: AnyFirstIteratorNode,
  Classified: ClassifiedNode,
  Deletable: DeletableNode,
  Partition: PartitionNode,
};

export const nodeShapes: Record<string, Shape> = {
  AnyFirstIterator: Shape.CIRCLE,
  Classified: Shape.CIRCLE,
  Deletable: Shape.CIRCLE,
  Partition: Shape.RECTANGLE,
};

export * from './AnyFirstIteratorNode';
export * from './ClassifiedNode';
export * from './DeletableNode';
export * from './PartitionNode';
