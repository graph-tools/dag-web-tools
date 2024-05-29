import { DirectedAcyclicGraphMock } from './DirectedAcyclicGraphMock';
import { getMockNodes } from '../utils';
import { MockNode } from '..';

/**
 * Creates the antichain DAG:
 * ```
 * 1 2 3    size
 * N N N ... N
 * ```
 * * total `size` nodes.
 *
 * @param size - Count of nodes in the antichain DAG.
 *
 * @returns Mock object of the specified DAG.
 */
export class AntichainMock extends DirectedAcyclicGraphMock<MockNode> {
  constructor(size: number) {
    const nodes = getMockNodes(size);
    const adjacencyLists = new Map<MockNode, MockNode[]>();

    nodes.forEach((node) => adjacencyLists.set(node, []));

    super({
      nodes: new Set<MockNode>(nodes),
      ancestors: new Map(),
      descendants: new Map(),
      size: { nodes: size, edges: 0, depth: 0, width: size },
      sorted: nodes,
    });
  }
}
