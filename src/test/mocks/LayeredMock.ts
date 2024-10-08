import { DirectedAcyclicGraphMock } from './DirectedAcyclicGraphMock';
import { getMockNodes } from '../utils';
import { ForceMap } from '../../utils';
import { MockNode } from '..';

function getDescendants(layers: MockNode[][]) {
  const descendants = new ForceMap<MockNode, Set<MockNode>[]>(() => [
    new Set(),
  ]);

  for (let from = 0; from < layers.length; ++from) {
    for (let depth = 1; depth < layers.length - from; ++depth) {
      const fromDescendants = new Set([
        ...descendants.forceGet(layers[from][0])[depth - 1],
        ...layers[from + depth],
      ]);

      layers[from].forEach(
        (node) => (descendants.forceGet(node)[depth] = fromDescendants),
      );
    }
  }

  return descendants;
}

/**
 * Creates the complete layered DAG:
 * ```
 * 1  2 3 4      size[0]  |
 * A  A A A ... A A       | A _ _ _    _ _
 * | / / /     / /        | |\ \ \ \    \ \
 * |/_/_/    _/_/         | | \ \ \ \    \ \
 * B _                    | B B B B B ... B B
 * |\ \ ...               | 1 2 3 4 5      size[1]
 * ```
 * * each node from `i` layer connected with each node from `i+1` layer
 * * edges directed like `A->B->C->D->...->Z`
 * * total sum_i(size[i]) nodes.
 *
 * @param size - Array with nodes counts, `size[i]` - requested size of layer `i`.
 *
 * @returns Mock object of the specified DAG.
 */
export class LayeredMock extends DirectedAcyclicGraphMock<MockNode> {
  constructor(size: number[]) {
    const layers: MockNode[][] = [];
    size.forEach((layer) => layers.push(getMockNodes(layer)));

    const edges = new Set<[MockNode, MockNode]>();
    layers.forEach(
      (layer, index) =>
        index + 1 < layers.length &&
        layer.forEach((tail) =>
          layers[index + 1].forEach((head) => edges.add([tail, head])),
        ),
    );

    const descendants = getDescendants(layers);
    const ancestors = getDescendants(layers.reverse());

    const nodes = layers.flat();
    super({
      nodes: new Set<MockNode>(nodes),
      edges,
      ancestors,
      descendants,
      size: {
        nodes: nodes.length,
        edges: size.reduce(
          (acc, cur, index) => acc + (size[index - 1] ?? 0) * cur,
          0,
        ),
        depth: size.length - 1,
        width: Math.max(...size),
      },
      sorted: nodes,
    });
  }
}
