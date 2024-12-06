import { AbstractDirectedMultipartite, ReadonlyDirectedAcyclicGraph } from '..';

type IterationOptions<Node> = {
  multipartite: AbstractDirectedMultipartite<Node>;
  source: ReadonlyDirectedAcyclicGraph<Node>;
  base: Map<Node, number>;
  ignore?: Set<Node>;
};
function iteration<Node>({
  multipartite,
  source,
  base,
  ignore,
}: IterationOptions<Node>): Map<Node, number> {
  const order = new Map<Node, number>();

  let parentsCount: number;
  for (const [partOrder, part] of multipartite) {
    for (const node of part) {
      if (ignore?.has(node)) {
        continue;
      }

      parentsCount = 0;
      for (const parent of source.parentsOf(node)) {
        if (
          !multipartite.hasNode(parent) ||
          partOrder <= multipartite.orderOf(parent)!
        ) {
          continue;
        }

        order.set(
          node,
          (order.get(node) ?? 0) +
            (base.get(parent) ?? 0) /
              (partOrder - multipartite.orderOf(parent)!),
        );
        ++parentsCount;
      }

      if (order.has(node)) {
        order.set(node, order.get(node)! / parentsCount);
      }
    }
  }

  return order;
}

/**
 * Gets *stable nodes* of the `multipartite`.
 * Stable node - a node that is the only parent for its children.
 *
 * @param multipartite - Directed multipartite graph mask over `source` graph.
 * @param source - Source graph for multipartite mask.
 *
 * @returns Set of the stable nodes.
 */
function getStableNodes<Node>(
  multipartite: AbstractDirectedMultipartite<Node>,
  source: ReadonlyDirectedAcyclicGraph<Node>,
): Set<Node> {
  const stable = new Set<Node>();

  let stableParent: Node | null = null;
  for (const [order, nodes] of multipartite) {
    for (const node of nodes) {
      stableParent = null;

      for (const parent of source.parentsOf(node)) {
        if (
          !multipartite.hasNode(parent) ||
          order <= multipartite.orderOf(parent)!
        ) {
          continue;
        }

        if (stableParent !== null) {
          stableParent == null;
          break;
        }

        stableParent = parent;
      }

      if (stableParent) stable.add(stableParent);
    }
  }

  return stable;
}

export interface PlanarizationParams {
  base: number;
  wind: number;
  gravity: number;
}

/**
 * This algorithm reduces the number of edge intersections
 * in a k-partite directed graph by changing the order of vertices in the parts
 *
 * @param multipartite - Directed multipartite graph mask over `source` graph.
 * @param source - Source graph.
 *
 * @returns The new order of nodes in each part.
 */
export function planarizeDirectedMultipartite<Node>(
  multipartite: AbstractDirectedMultipartite<Node>,
  source: ReadonlyDirectedAcyclicGraph<Node>,
  params: PlanarizationParams = {
    wind: 1 / 3,
    base: 1 / 3,
    gravity: 1 / 3,
  },
) {
  let maxPartSize = 0;

  for (const [, part] of multipartite) {
    maxPartSize = Math.max(part.size, maxPartSize);
  }

  const positions = new Map<Node, number>();

  let base: number;
  let offset: number;
  for (const [, part] of multipartite) {
    base = Math.floor(maxPartSize - part.size);
    offset = 0;
    for (const node of part) {
      positions.set(node, base + offset++);
    }
  }

  const wind = iteration({
    multipartite,
    source,
    base: positions,
  });

  const stable = getStableNodes(multipartite, source);
  const gravity = iteration<Node>({
    multipartite,
    source: source.reversed(),
    base: positions,
    ignore: stable,
  });

  let position: number;
  for (const [, part] of multipartite) {
    for (const node of part) {
      position = params.base * (positions.get(node) ?? 0);
      position += params.wind * (wind.get(node) ?? 0);
      if (stable.has(node)) {
        position += params.gravity * (positions.get(node) ?? 0);
      } else {
        position += params.gravity * (gravity.get(node) ?? 0);
      }

      positions.set(node, position);
    }
  }

  return positions;
}
