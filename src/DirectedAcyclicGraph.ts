import { DepthFirstIterator, IteratorInjectOn } from './algo';
import { CycleProhibitedException } from './exeptions';
import {
  AbstractDirectedAcyclicGraph,
  DirectedAsyclicGraphSize,
  ReadonlyDirectedAcyclicGraph,
} from './models';
import { NodeWithActions } from './NodeWithActions';
import { ForceMap } from './utils';

function getDefaultNodeSet<Node>() {
  return new Set<Node>();
}

/**
 * Contains strategies for edge addition.
 */
export enum EdgeAdditionStrategy {
  /**
   * Adding an edge will trigger a validation check.
   */
  UNSAFE = 'unsafe',
  /**
   * Adding an edge will trigger a validation check.
   */
  SAFE = 'safe',
}

export type DirectedAcyclicGraphOptions = {
  edgeAdditionStrategy: EdgeAdditionStrategy;
};

export class DirectedAcyclicGraphEdgeIterator<Node>
  implements IterableIterator<[Node, Node]>
{
  private tail: Node | null = null;
  private tailIterator: IterableIterator<Node>;
  private headIterator: IterableIterator<Node>;

  constructor(private dag: ReadonlyDirectedAcyclicGraph<Node>) {
    this.tailIterator = dag.nodes;
    this.headIterator = [][Symbol.iterator]();
  }

  [Symbol.iterator]() {
    return this;
  }

  next(): IteratorResult<[Node, Node]> {
    for (;;) {
      const { done, value } = this.headIterator.next();
      if (this.tail === null || done) {
        const { done, value } = this.tailIterator.next();
        if (done) return { done: true } as IteratorResult<[Node, Node]>;

        this.tail = value;
        this.headIterator = this.dag.childrenOf(this.tail)[Symbol.iterator]();
      } else {
        return { done: false, value: [this.tail, value] } as const;
      }
    }
  }
}

export class DirectedAcyclicGraph<Node>
  implements AbstractDirectedAcyclicGraph<Node>
{
  private _options: DirectedAcyclicGraphOptions;

  /**
   * Contains each added node.
   * @internal
   */
  private _nodes = new Set<Node>();

  /**
   * Contains mapping between nodes and its parents.
   * @internal
   */
  private _parents = new ForceMap<Node, Set<Node>>(getDefaultNodeSet<Node>);

  /**
   * Contains mapping between nodes and its children.
   * @internal
   */
  private _children = new ForceMap<Node, Set<Node>>(getDefaultNodeSet<Node>);

  /**
   * Contains cached values of DAG's sizes.
   * @internal
   */
  private _size = {
    /**
     * @inheritdoc
     *
     * @remarks
     * Time complexity (V8): `O(1)`
     */
    nodes: -1,

    /**
     * @inheritdoc
     *
     * @remarks
     * Time complexity (V8): `O(1)`
     */
    edges: 0,

    /**
     * @inheritdoc
     *
     * @remarks
     * Time complexity (V8): `O(n)` where
     * * `n` - number of nodes in the DAG.
     */
    depth: -1,

    /**
     * @inheritdoc
     *
     * @remarks
     * Time complexity (V8): `O(n)` where
     * * `n` - number of nodes in the DAG.
     */
    width: -1,
  };

  private _sorted: Node[] | null = null;

  private _sizeMappings: Record<keyof DirectedAsyclicGraphSize, () => number> =
    {
      nodes: () => this._nodes.size,
      edges: () => this._size.edges,
      depth: () => {
        if (this._size.depth < 0) this._size.depth = this._depth();
        return this._size.depth;
      },
      width: () => {
        if (this._size.width < 0) this._size.width = this._width();
        return this._size.width;
      },
    };

  /**
   * Creates empty DAG.
   *
   * @param options - Options for new DAG.
   */
  constructor(options?: DirectedAcyclicGraphOptions) {
    this._options = {
      edgeAdditionStrategy:
        options?.edgeAdditionStrategy ?? EdgeAdditionStrategy.UNSAFE,
    };
  }

  /**
   * Creates the DAG from any other DAG.
   *
   * @param source - DAG to be source for a new one.
   */
  static from<Node>(
    source: ReadonlyDirectedAcyclicGraph<Node>,
    options?: DirectedAcyclicGraphOptions,
  ) {
    const dag = new DirectedAcyclicGraph<Node>(options);

    dag._nodes = new Set(source.nodes);
    for (const node of source.nodes) {
      dag._parents.set(node, new Set(source.parentsOf(node)));
      dag._children.set(node, new Set(source.childrenOf(node)));
      dag._size.edges += dag._parents.forceGet(node).size;
    }

    return dag;
  }

  public size = new Proxy<DirectedAsyclicGraphSize>(this._size, {
    get: (_, prop: keyof DirectedAsyclicGraphSize) => {
      return this._sizeMappings[prop]();
    },
  });

  public get nodes() {
    return this._nodes.values();
  }

  public get edges(): IterableIterator<[Node, Node]> {
    return new DirectedAcyclicGraphEdgeIterator(this);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the DAG.
   */
  public *[Symbol.iterator]() {
    yield* this.sorted();
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public clear() {
    this._nodes.clear();
    this._parents.clear();
    this._children.clear();

    this._size.edges = 0;
    this._size.depth = -1;
    this._size.width = -1;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public add(node: Node) {
    if (this._nodes.has(node)) {
      return false;
    }
    this._nodes.add(node);

    ++this._size.width;
    if (this._sorted === null) {
      this._sorted = [];
    }
    this._sorted.push(node);

    return true;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): O(n) where
   * * `n` - nodes in the affected region (children + parents).
   */
  public delete(node: Node) {
    if (!this._nodes.has(node)) return false;

    this._parents.get(node)?.forEach((parent) => this.disconnect(parent, node));
    this._children.get(node)?.forEach((child) => this.disconnect(node, child));

    this._nodes.delete(node);
    this._parents.delete(node);
    this._children.delete(node);

    return true;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8):
   * * `O(1)`, if the DAG uses unsafe edge addition strategy
   * * `O(n)`, if the DAG uses safe edge addition strategy, where
   * * `n` - nodes in the affected region (depth first path search).
   */
  public connect(from: Node, to: Node) {
    if (this.hasEdge(from, to)) return false;
    if (this._options.edgeAdditionStrategy === EdgeAdditionStrategy.SAFE) {
      if (this.hasPathBetween(to, from))
        throw new CycleProhibitedException(
          `Adding a designated edge (${from}, ${to}) forms a loop`,
        );
    }

    this._nodes.add(from).add(to);
    this._children.forceGet(from).add(to);
    this._parents.forceGet(to).add(from);
    ++this._size.edges;

    this._size.width = -1;
    this._size.depth = -1;
    this._sorted = null;
    return true;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public disconnect(from: Node, to: Node) {
    if (!this.hasEdge(from, to)) return false;

    this._children.get(from)?.delete(to);
    this._parents.get(to)?.delete(from);
    --this._size.edges;

    this._size.width = -1;
    this._size.depth = -1;
    this._sorted = null;
    return true;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public has(node: Node) {
    return this._nodes.has(node);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(1)`
   */
  public hasEdge(tail: Node, head: Node) {
    return Boolean(this._children.get(tail)?.has(head));
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the tree affected by the iteration.
   */
  public hasPathBetween(tail: Node, head: Node, maxLength: number = +Infinity) {
    if (tail === head) return true;
    const iterator = new DepthFirstIterator(this, tail, { depth: maxLength });

    for (const [node, details] of iterator) {
      if (details.depth !== 0 && node === head) return true;
    }
    return false;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the tree affected by the iteration.
   */
  public ancestorsOf(
    descendant: Node,
    maxDepth: number = +Infinity,
  ): ReadonlySet<Node> {
    const ancestors = new Set<Node>();

    const iterator = new DepthFirstIterator(this.reversed(), descendant, {
      depth: maxDepth,
    });

    for (const [currentNode, details] of iterator) {
      if (details.depth !== 0) ancestors.add(currentNode);
    }
    return ancestors;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the tree affected by the iteration.
   */
  public descendantsOf(
    ancestor: Node,
    maxDepth: number = +Infinity,
  ): ReadonlySet<Node> {
    const descendants = new Set<Node>();

    const iterator = new DepthFirstIterator(this, ancestor, {
      depth: maxDepth,
    });

    for (const [currentNode, details] of iterator) {
      if (details.depth !== 0) descendants.add(currentNode);
    }
    return descendants;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the tree affected by the iteration.
   */
  public parentsOf(node: Node): ReadonlySet<Node> {
    return this._parents.get(node) ?? new Set<Node>();
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the tree affected by the iteration.
   */
  public childrenOf(node: Node): ReadonlySet<Node> {
    return this._children.get(node) ?? new Set<Node>();
  }

  public node(node: Node): NodeWithActions<Node> {
    return new NodeWithActions<Node>(node, this);
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * This method creates only another representation and *does not* create a copy of the graph.
   * Changes in the representation will affect the original one. To avoid this behavior use the
   * copy constructor on returned value.
   *
   * Time complexity (V8): `O(1)`
   */
  public reversed() {
    const reverse = new DirectedAcyclicGraph<Node>();

    reverse._nodes = this._nodes;
    reverse._parents = this._children;
    reverse._children = this._parents;

    return reverse;
  }

  /**
   * @inheritdoc
   *
   * @remarks
   * Time complexity (V8): `O(n)` where
   * * `n` - number of nodes in the DAG.
   */
  public sorted() {
    if (this._sorted === null) {
      this._sorted = [];
      const visited = new Set<Node>();

      let iterator: DepthFirstIterator<Node>;
      for (const node of this._nodes) {
        iterator = new DepthFirstIterator(this, node, {
          ignore: visited,
          injectOn: IteratorInjectOn.LEAVE,
        });

        for (const [node] of iterator) {
          this._sorted.unshift(node);
          visited.add(node);
        }
      }
    }
    return this._sorted;
  }

  public validate() {}

  /**
   * Calculates depth of the DAG.
   *
   * @internal
   */
  private _depth() {
    let depth = 0;
    let currentDepth = 0;

    const visited = new Set<Node>();
    const depths = new Map<Node, number>();

    let iterator: DepthFirstIterator<Node>;
    for (const node of this._nodes) {
      iterator = new DepthFirstIterator(this, node, {
        ignore: visited,
        injectOn: IteratorInjectOn.LEAVE,
      });

      for (const [node] of iterator) {
        if (this.childrenOf(node).size == 0) {
          currentDepth = 0;
        } else {
          for (const child of this.childrenOf(node)) {
            if ((depths.get(child) ?? 0) + 1 > currentDepth) {
              currentDepth = (depths.get(child) ?? 0) + 1;
            }
          }
        }

        if (depth < currentDepth) {
          depth = currentDepth;
        }
        depths.set(node, currentDepth);
        visited.add(node);
      }
    }

    return depth;
  }

  /**
   * Calculates depth of the DAG.
   *
   * @internal
   */
  private _width() {
    let width = 0;

    const nodes = new Set<Node>(this._nodes);

    let degree: number = 0;
    let minDegree: number = 0;
    let minDegreeNode: Node | null = null;
    for (;;) {
      minDegreeNode = null;
      minDegree = +Infinity;
      for (const node of nodes) {
        degree = this.parentsOf(node).size + this.childrenOf(node).size;
        if (0 < degree && degree < minDegree) {
          minDegree = degree;
          minDegreeNode = node;
        }
      }

      if (minDegreeNode === null) {
        break;
      }

      nodes.delete(minDegreeNode);
      for (const descendant of this.descendantsOf(minDegreeNode)) {
        nodes.delete(descendant);
      }
      for (const acncestor of this.ancestorsOf(minDegreeNode)) {
        nodes.delete(acncestor);
      }

      ++width;
    }

    return width;
  }
}
