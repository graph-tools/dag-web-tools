import {
  InvalidSubPartitioningError,
  UnmatchedSubPartitionError,
} from './exeptions';
import { AbstractSubPartition, ReadonlyPartition } from './models';
import { Partition } from './Partition';

import { ForceMap } from './utils';

export class SubPartition<Node>
  extends Partition<Node>
  implements AbstractSubPartition<Node>
{
  /**
   * Contains mapping of super-part to its sub-parts.
   * @internal
   */
  protected _subparts = new ForceMap<ReadonlySet<Node>, Set<ReadonlySet<Node>>>(
    () => new Set(),
  );

  constructor(
    partition: Iterable<Iterable<Node>>,
    parent: Iterable<Iterable<Node>>,
  ) {
    super(partition);
    this.parent = new Partition(parent);

    if (this.size.nodes !== this.parent.size.nodes) {
      throw new UnmatchedSubPartitionError();
    }

    let superpart: ReadonlySet<Node> | undefined;
    for (const part of this.parts()) {
      if (!(superpart = this.superpart(part)))
        throw new UnmatchedSubPartitionError();

      this._subparts.forceGet(superpart).add(part);

      for (const node of part) {
        if (!this.parent.has(node)) throw new UnmatchedSubPartitionError();

        if (this.parent.get(node) !== superpart)
          throw new InvalidSubPartitioningError();
      }
    }
  }

  /**
   * @inheritdoc
   */
  public readonly parent: ReadonlyPartition<Node>;

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public subparts(
    superpart: ReadonlySet<Node>,
  ): ReadonlySet<ReadonlySet<Node>> {
    if (this.parent.has(superpart)) {
      return this._subparts.get(superpart)!;
    }
    return new Set();
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public superpart(
    item: Node | ReadonlySet<Node>,
  ): ReadonlySet<Node> | undefined {
    if (this._index.has(item as Node)) {
      const node = item as Node;
      return this.parent.get(node);
    } else if (this._parts.has(item as ReadonlySet<Node>)) {
      const part = item as ReadonlySet<Node>;
      return this.parent.get(part.values().next().value!);
    }
    return undefined;
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  public move(node: Node, part: ReadonlySet<Node>): boolean {
    if (this.has(part) && this.superpart(node) !== this.superpart(part))
      return false;
    if (!super.move(node, part)) return false;

    if (part.size === 0) {
      this._subparts.get(this.superpart(node)!)!.add(this.get(node)!);
    }

    return true;
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`.
   */
  protected _cleanup(part: ReadonlySet<Node>, value: Node): void {
    super._cleanup(part, value);
    this._subparts.get(this.parent.get(value)!)!.delete(part);
  }
}
