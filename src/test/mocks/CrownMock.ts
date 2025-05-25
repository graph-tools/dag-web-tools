import { DirectedAcyclicGraphMock } from './DirectedAcyclicGraphMock';
import { getMockEdge, getMockNodes } from '../utils';
import { ForceMap } from '../../utils';
import { MockEdge, MockNode } from '..';
import { DirectedAcyclicGraphEdgeArgs } from 'src/models';

/**
 * Creates the crown DAG:
 * ```
 * 1  2  3       size
 * T  T  T ... T  T
 * |\/ \/       \/|
 * |/\ /\       /\|
 * B  B  B ... B  B
 * ```
 * * edges directed like `T->B`
 * * total 2-`size` nodes.
 *
 * @param size - Count of columns in the crown DAG.
 *
 * @returns Mock object of the specified DAG.
 */
export class CrownMock extends DirectedAcyclicGraphMock<MockNode, MockEdge> {
  constructor(size: number) {
    const top = getMockNodes(size);
    const bottom = getMockNodes(size);
    const edges = new Set<DirectedAcyclicGraphEdgeArgs<MockNode, MockEdge>>();
    const ancestors = new ForceMap<MockNode, Set<MockNode>[]>(() => [
      new Set(),
      new Set(),
    ]);
    const descendants = new ForceMap<MockNode, Set<MockNode>[]>(() => [
      new Set(),
      new Set(),
    ]);

    top.forEach((node, index) => {
      const firstChild = bottom[Math.max(0, index - 1)];
      const secondChild = bottom[Math.min(index + 1, size - 1)];

      edges
        .add([node, firstChild, getMockEdge()])
        .add([node, secondChild, getMockEdge()]);

      descendants.forceGet(node)[1].add(firstChild).add(secondChild);
      ancestors.forceGet(firstChild)[1].add(node);
      ancestors.forceGet(secondChild)[1].add(node);
    });

    super({
      nodes: new Set<MockNode>([...top, ...bottom]),
      edges,
      ancestors,
      descendants,
      size: { nodes: 2 * size, edges: 2 * size, depth: 1, width: size },
      sorted: [...top, ...bottom],
    });
  }
}
