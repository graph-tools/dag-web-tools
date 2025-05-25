import { AbstractDirectedMultipartite, ReadonlyDirectedAcyclicGraph } from '..';

type IterationOptions<Node, Edge = unknown> = {
  multipartite: AbstractDirectedMultipartite<Node>;
  source: ReadonlyDirectedAcyclicGraph<Node, Edge>;
  base: Map<Node, number>;
  ignore?: Set<Node>;
};
function iteration<Node, Edge = unknown>({
  multipartite,
  source,
  base,
  ignore,
}: IterationOptions<Node, Edge>): Map<Node, number> {
  const order = new Map<Node, number>();

  let parentsCount: number;
  for (const [partOrder, part] of multipartite) {
    for (const node of part) {
      if (ignore?.has(node)) {
        continue;
      }

      parentsCount = 0;
      for (const parent of source.parentsOf(node)) {
        if (!multipartite.hasNode(parent)) continue;
        if (partOrder <= multipartite.orderOf(parent)!) continue;

        const currentOrder = order.get(node) ?? 0;
        const baseParent = base.get(parent) ?? 0;
        const parentOrder = multipartite.orderOf(parent) ?? 0;
        const partDiff = Math.max(1, partOrder - parentOrder);

        const newOrder = currentOrder + baseParent / partDiff;
        order.set(node, newOrder);

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
function getStableNodes<Node, Edge = unknown>(
  multipartite: AbstractDirectedMultipartite<Node>,
  source: ReadonlyDirectedAcyclicGraph<Node, Edge>,
): Set<Node> {
  const stable = new Set<Node>();
  const unstable = new Set<Node>();

  for (const [order, nodes] of multipartite) {
    for (const node of nodes) {
      const parents = source.parentsOf(node);
      if (parents.size > 1) {
        for (const parent of parents) unstable.add(parent);
        continue;
      }

      for (const parent of parents) {
        if (!multipartite.hasNode(parent)) continue;
        if (order <= multipartite.orderOf(parent)!) continue;
        if (!unstable.has(parent)) stable.add(parent);
      }
    }
  }

  for (const node of unstable) stable.delete(node);

  return stable;
}

export interface PlanarizationParams {
  base?: number;
  wind?: number;
  gravity?: number;
  useStable?: boolean;
}

const MAX_ITERATION_COUNT = 10;

/**
 * This algorithm reduces the number of edge intersections
 * in a k-partite directed graph by changing the order of vertices in the parts
 *
 * @param multipartite - Directed multipartite graph mask over `source` graph.
 * @param source - Source graph.
 *
 * @returns The new order of nodes in each part.
 */
export function planarizeDirectedMultipartite<Node, Edge = unknown>(
  multipartite: AbstractDirectedMultipartite<Node>,
  source: ReadonlyDirectedAcyclicGraph<Node, Edge>,
  params?: PlanarizationParams,
) {
  const {
    base = 1 / 3,
    gravity = 1 / 3,
    wind = 1 / 3,
    useStable = true,
  } = params ?? {};

  const windOffset = useStable ? gravity + wind : 0;

  const maxPartSize = Math.max(
    ...Array.from(multipartite).map(([, part]) => part.size),
  );

  const positions = new Map<Node, number>();

  let basePosition: number;
  let offset: number;
  for (const [, part] of multipartite) {
    basePosition = Math.floor(maxPartSize - part.size);
    offset = 0;
    for (const node of part) {
      positions.set(node, basePosition + offset++);
    }
  }

  let positionsChanged = false;
  for (let i = 0; i < MAX_ITERATION_COUNT; i++) {
    const prevPositions = new Map(positions);

    const windOrder = iteration({
      multipartite,
      source,
      base: positions,
    });

    const stable = useStable
      ? getStableNodes(multipartite, source)
      : new Set<Node>();

    const gravityOrder = iteration<Node, Edge>({
      multipartite: multipartite.revert(),
      source: source.reversed(),
      base: positions,
      ignore: stable,
    });

    let position: number;
    for (const [, part] of multipartite) {
      for (const node of part) {
        const currentPosition = positions.get(node) ?? 0;
        const windPosition = windOrder.get(node) ?? 0;
        const gravityPosition = gravityOrder.get(node) ?? 0;

        position = base * currentPosition;
        position += (wind + windOffset) * windPosition;
        if (stable.has(node)) {
          position += (gravity * (currentPosition + gravityPosition)) / 2;
        } else {
          position += gravity * gravityPosition;
        }

        positions.set(node, position);
      }
    }

    positionsChanged = false;
    for (const [, part] of multipartite) {
      Array.from(part)
        .sort((a, b) => positions.get(a)! - positions.get(b)!)
        .forEach((value, i) => {
          positions.set(value, i);
          if (!positionsChanged && prevPositions.get(value) !== i) {
            positionsChanged = true;
          }
        });
    }

    if (!positionsChanged) break;
  }

  return positions;
}
