import { ReadonlyDirectedAcyclicGraph } from '../models';
import { CycleProhibitedException } from '../exeptions';

/**
 * Contains strategies for injection code at iteration time.
 */
export const enum IteratorInjectOn {
  /**
   * Iterator will provide control when entering the node.
   */
  ENTER = 'enter',
  /**
   * Iterator will provide control when leaving the node.
   */
  LEAVE = 'leave',
  /**
   * Iterator will provide control both when entering and leaving the node.
   */
  ALL = 'all',
}

export type DepthIteratorOptions<Node> = {
  /**
   * Defines depth of the iteration tree.
   */
  depth: number;

  /**
   * Defines when the iterator should provide control.
   */
  injectOn: IteratorInjectOn;

  /**
   * Defines nodes that will be ignored during iteration.
   */
  ignore: ReadonlySet<Node>;
};

export type DepthIteratorDetails = {
  /**
   * Contains depth of the node.
   */
  depth: number;

  /**
   * Contains injection time.
   */
  injectOn: IteratorInjectOn;
};

type DepthSearchStackItem<Node> = [Node, Iterator<Node, undefined>];

const enum DepthSearchNodeColor {
  GRAY = 'gray',
  BLACK = 'black',
}

export type DepthIteratorItem<Node> = [Node, DepthIteratorDetails];

export class DepthFirstIterator<Node>
  implements
    Iterator<DepthIteratorItem<Node>>,
    Iterable<DepthIteratorItem<Node>>
{
  /**
   * Contains the `root`'s source graph.
   */
  private _graph: ReadonlyDirectedAcyclicGraph<Node>;

  /**
   * Contains specified options.
   */
  private _options: DepthIteratorOptions<Node>;

  /**
   * Contains colors of nodes.
   */
  private _colors = new Map<Node, DepthSearchNodeColor>();

  /**
   * Contains the iteration stack.
   */
  private _stack: DepthSearchStackItem<Node>[];

  private shouldYieldOnEnter: boolean;
  private shouldYieldOnLeave: boolean;

  constructor(
    graph: ReadonlyDirectedAcyclicGraph<Node>,
    root: Node,
    options?: Partial<DepthIteratorOptions<Node>>,
  ) {
    this._graph = graph;
    this._options = {
      depth: options?.depth ?? +Infinity,
      ignore: options?.ignore ?? new Set<Node>(),
      injectOn: options?.injectOn ?? IteratorInjectOn.ENTER,
    };

    this.shouldYieldOnEnter =
      this._options.injectOn === IteratorInjectOn.ENTER ||
      this._options.injectOn === IteratorInjectOn.ALL;
    this.shouldYieldOnLeave =
      this._options.injectOn === IteratorInjectOn.LEAVE ||
      this._options.injectOn === IteratorInjectOn.ALL;

    this._stack = [];
    if (!this._options.ignore.has(root) && this._options.depth >= 0) {
      this._stack.push([root, graph.childrenOf(root)[Symbol.iterator]()]);
    }
  }

  [Symbol.iterator]() {
    return this;
  }

  next(): IteratorResult<DepthIteratorItem<Node>, undefined> {
    let child: Node;
    for (;;) {
      if (this._stack.length === 0) {
        return { done: true, value: undefined };
      }
      const [node, childrenIterator] = this._stack[this._stack.length - 1];

      if (this._colors.get(node) === undefined) {
        this._colors.set(node, DepthSearchNodeColor.GRAY);

        if (this.shouldYieldOnEnter) {
          return {
            done: false,
            value: [
              node,
              {
                depth: this._stack.length - 1,
                injectOn: IteratorInjectOn.ENTER,
              },
            ],
          };
        }
      }

      const childrenIteratorItem = childrenIterator.next();
      if (childrenIteratorItem.done) {
        this._stack.pop();
        this._colors.set(node, DepthSearchNodeColor.BLACK);

        if (this.shouldYieldOnLeave) {
          return {
            done: false,
            value: [
              node,
              {
                depth: this._stack.length,
                injectOn: IteratorInjectOn.LEAVE,
              },
            ],
          };
        }

        continue;
      }

      child = childrenIteratorItem.value;
      if (
        this._options.ignore.has(child) ||
        this._colors.get(child) !== undefined ||
        this._stack.length > this._options.depth
      ) {
        if (this._colors.get(child) === DepthSearchNodeColor.GRAY) {
          throw new CycleProhibitedException(
            'Cycle found when traversing depth-first iterator',
          );
        }
        continue;
      }

      this._stack.push([
        child,
        this._graph.childrenOf(child)[Symbol.iterator](),
      ]);
    }
  }
}
