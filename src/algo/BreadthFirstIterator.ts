import { ReadonlyDirectedAcyclicGraph } from '../models/DirectedAcyclicGraph';

export type BreadthIteratorOptions<Node> = {
  /**
   * Defines depth of the iteration tree.
   */
  depth: number;

  /**
   * Defines nodes that will be ignored during iteration.
   */
  ignore: ReadonlySet<Node>;
};

export type BreadthIteratorDetails = {
  /**
   * Contains depth of the node.
   */
  depth: number;
};

export type BreadthIteratorItem<Node> = [Node, BreadthIteratorDetails];

/**
 * Breadth First DAG iterator.
 */
export class BreadthFirstIterator<Node>
  implements
    Iterator<BreadthIteratorItem<Node>>,
    Iterable<BreadthIteratorItem<Node>>
{
  /**
   * Contains the `root`'s source graph.
   *
   * @internal
   */
  private _graph: ReadonlyDirectedAcyclicGraph<Node>;

  /**
   * Contains specified options.
   *
   * @internal
   */
  private _options: BreadthIteratorOptions<Node>;

  /**
   * Contains iteration queue.
   *
   * @internal
   */
  private _queue: Node[];

  /**
   * Contains nodes visited during iteration.
   *
   * @internal
   */
  private _visited = new Set<Node>();

  /**
   * Contains index of the current iterating node.
   *
   * @internal
   */
  private _index = 0;

  /**
   * Contains depth of the current iterating node.
   *
   * @internal
   */
  private _depth = 0;

  /**
   * Contains the node index for the next depth increment.
   *
   * @internal
   */
  private _nextDepthIndex = 1;

  constructor(
    graph: ReadonlyDirectedAcyclicGraph<Node>,
    root: Node,
    options?: Partial<BreadthIteratorOptions<Node>>,
  ) {
    this._graph = graph;
    this._options = {
      depth: options?.depth ?? +Infinity,
      ignore: options?.ignore ?? new Set<Node>(),
    };

    this._queue = [];
    if (!this._options.ignore.has(root) && this._options.depth >= 0) {
      this._queue.push(root);
      this._visited.add(root);
    }
  }

  [Symbol.iterator]() {
    return this;
  }

  next(): IteratorResult<BreadthIteratorItem<Node>, undefined> {
    let node: Node | undefined;
    for (;;) {
      node = this._queue.shift();
      if (node === undefined) {
        return {
          done: true,
          value: undefined,
        };
      }

      if (this._index === this._nextDepthIndex) {
        this._nextDepthIndex += this._queue.length + 1;
        ++this._depth;
      }

      if (this._depth + 1 <= this._options.depth) {
        for (const child of this._graph.childrenOf(node)) {
          if (this._visited.has(child)) {
            continue;
          }
          if (!this._options.ignore.has(child)) {
            this._queue.push(child);
            this._visited.add(child);
          }
        }
      }

      ++this._index;
      return {
        done: false,
        value: [node, { depth: this._depth }],
      };
    }
  }
}

export default BreadthFirstIterator;
