import { ReadonlyDirectedAcyclicGraph } from '../models';
import { ForceMap, Trie } from '../utils';

/**
 * Split `nodes` into equivalence classes by equivalence relation
 * `a ~ b <=> parentsOf(a) = parentsOf(b)`
 *
 * @param dag - Souce graph.
 * @param nodes - Subset of nodes to be classified.
 *
 * @returns Canonical projection of quotient set.
 *
 * @remarks
 * Time complexity (V8): `O(n^2 + e)` where
 * * `n` - number of nodes in the DAG
 * * `e` - number of edges in the DAG.
 */
export function getEquivalentNodesByParents<Node, Edge = unknown>(
  dag: ReadonlyDirectedAcyclicGraph<Node, Edge>,
  nodes: Set<Node>,
) {
  const projection = new Map<Node, Set<Node>>();
  const sortedParents = new ForceMap<Node, Node[]>(() => []);
  const equivalenceClass = new Trie<Node, Set<Node>>();

  for (const node of dag) {
    if (!nodes.has(node)) continue;

    const parents = sortedParents.forceGet(node);
    const cls =
      equivalenceClass.get(parents) ??
      equivalenceClass.set(parents, new Set<Node>());
    cls.add(node);
    projection.set(node, cls);

    for (const child of dag.childrenOf(node)) {
      if (!nodes.has(child)) continue;
      sortedParents.forceGet(child).push(node);
    }
  }

  return projection;
}

/**
 * Split `nodes` into equivalence classes by equivalence relation
 * `a ~ b <=> childrenOf(a) = childrenOf(b)`
 *
 * @param dag - Souce graph.
 * @param nodes - Subset of nodes to be classified.
 *
 * @returns Canonical projection of quotient set.
 *
 * @remarks
 * Time complexity (V8): `O(n^2 + e)` where
 * * `n` - number of nodes in the DAG
 * * `e` - number of edges in the DAG.
 */
export function getEquivalentNodesByChildren<Node, Edge = unknown>(
  dag: ReadonlyDirectedAcyclicGraph<Node, Edge>,
  nodes: Set<Node>,
) {
  return getEquivalentNodesByParents(dag.reversed(), nodes);
}

/**
 * Split `nodes` into equivalence classes by equivalence relation
 * `a ~ b <=> {parentsOf(a), childrenOf(a)} = {parentsOf(b), childrenOf(b)}`
 *
 * @param dag - Souce graph.
 * @param nodes - Subset of nodes to be classified.
 *
 * @returns Canonical projection of quotient set.
 *
 * @remarks
 * Time complexity (V8): `O(n^2 + e)` where
 * * `n` - number of nodes in the DAG
 * * `e` - number of edges in the DAG.
 */
export function getEquivalentNodes<Node, Edge = unknown>(
  dag: ReadonlyDirectedAcyclicGraph<Node, Edge>,
  nodes: Set<Node>,
) {
  const projection = new Map<Node, Set<Node>>();

  const pairMap = new ForceMap<Set<Node>, ForceMap<Set<Node>, Set<Node>>>(
    () => new ForceMap<Set<Node>, Set<Node>>(() => new Set<Node>()),
  );

  const byParents = getEquivalentNodesByParents(dag, nodes);
  const byChildren = getEquivalentNodesByChildren(dag, nodes);

  for (const node of nodes) {
    projection.set(
      node,
      pairMap
        .forceGet(byParents.get(node)!)
        .forceGet(byChildren.get(node)!)
        .add(node),
    );
  }

  return projection;
}
