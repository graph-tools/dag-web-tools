import { DirectedAcyclicGraphEdgeArgs } from 'src/models';

import { getMockEdge, getMockNodes } from '../utils';
import { ForceMap } from '../../utils';

import { DirectedAcyclicGraphMock } from './DirectedAcyclicGraphMock';

import { MockEdge, MockNode } from '..';

/**
 * Creates the chain DAG:
 * ```
 * 1  2  3      size
 * N->N->N->...->N
 * ```
 * * total `size` nodes.
 *
 * @param size - Count of nodes in the chain DAG.
 *
 * @returns Mock object of the specified DAG.
 */
export class ChainMock extends DirectedAcyclicGraphMock<MockNode, MockEdge> {
  constructor(size: number) {
    const nodes = getMockNodes(size);
    const edges = new Set<DirectedAcyclicGraphEdgeArgs<MockNode, MockEdge>>();
    const ancestors = new ForceMap<MockNode, Set<MockNode>[]>(() => []);
    const descendants = new ForceMap<MockNode, Set<MockNode>[]>(() => []);

    nodes.forEach((node, index) => {
      if (index !== 0) {
        edges.add([nodes[index - 1], node, getMockEdge()]);
      }
    });

    let ancestorsDepth: number = 0;
    let descendantsDepth: number = nodes.length - 1;
    nodes.forEach((node, index) => {
      for (let depth = 0; depth <= ancestorsDepth; ++depth) {
        ancestors.forceGet(node)[depth] = new Set<MockNode>(
          nodes.slice(Math.max(0, index - depth), index),
        );
      }
      for (let depth = 0; depth <= descendantsDepth; ++depth) {
        descendants.forceGet(node)[depth] = new Set<MockNode>(
          nodes.slice(index + 1, index + depth + 1),
        );
      }
      ++ancestorsDepth;
      --descendantsDepth;
    });

    super({
      nodes: new Set<MockNode>(nodes),
      edges,
      ancestors,
      descendants,
      size: { nodes: size, edges: size - 1, depth: size - 1, width: 1 },
      sorted: nodes,
    });
  }
}
