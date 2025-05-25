import { AbstractPartition } from './models';

type CleanupCallback<Node> = (part: ReadonlySet<Node>, value: Node) => void;

class Part<Node> extends Set<Node> {
  constructor(
    nodes: Iterable<Node>,
    protected cleanup: CleanupCallback<Node>,
  ) {
    super(nodes);
  }

  override delete(value: Node): boolean {
    if (super.delete(value)) {
      if (this.size === 0) this.cleanup(this, value);
      return true;
    }
    return false;
  }

  override clear(): void {
    const node = this.values().next().value!;

    super.clear();
    this.cleanup(this, node);
  }
}

export class Partition<Node> implements AbstractPartition<Node> {
  /**
   * Contains mapping of nodes into parts
   * @internal
   */
  protected _index = new Map<Node, Part<Node>>();

  /**
   * Contains parts of the partition
   * @internal
   */
  protected _parts = new Map<ReadonlySet<Node>, Part<Node>>();

  constructor(partition: Iterable<Iterable<Node>>) {
    let part: Part<Node> | null;
    for (const nodes of partition) {
      part = null;

      for (const node of nodes) {
        if (part) part.add(node);
        else part = this._add(node);

        this._index.set(node, part);
      }
    }
  }

  public readonly size = new Proxy(
    { nodes: 0, parts: 0 },
    {
      get: (_, name) => {
        switch (name) {
          case 'nodes':
            return this._index.size;
          case 'parts':
            return this._parts.size;
        }
      },
    },
  );

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public [Symbol.iterator]() {
    return this.parts();
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public nodes(): IterableIterator<Node> {
    return this._index.keys();
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public parts(): IterableIterator<ReadonlySet<Node>> {
    return this._parts.values();
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public has(item: Node | ReadonlySet<Node>): boolean {
    return this._index.has(item as Node) || this._parts.has(item as Part<Node>);
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public get(node: Node): ReadonlySet<Node> | undefined {
    return this._index.get(node);
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(1)`
   */
  public move(node: Node, part: ReadonlySet<Node>): boolean {
    if (!this._index.has(node)) return false;
    if (this._index.get(node)! === part) return false;
    if (!this._parts.has(part) && part.size !== 0) return false;

    let dest: Part<Node>;
    if (part.size !== 0) {
      dest = this._parts.get(part)!;
      dest.add(node);
    } else {
      dest = this._add(node);
    }

    this._index.get(node)!.delete(node);
    this._index.set(node, dest);

    return true;
  }

  /**
   * Function called each time some part no longer contains nodes and was automatically deleted.
   * Use this function to clean up resources allocated to some part of partition.
   *
   * @param part - Part that was deleted.
   * @param node - The last node whose deletion caused automatic deletion.
   *
   * @internal
   */
  protected _cleanup(...args: Parameters<CleanupCallback<Node>>): void {
    this._parts.delete(args[0]);
  }

  /**
   * Creates new part of the partition.
   *
   * @param node - Node to be initializer or the new part.
   *
   * @returns New part of the partition initialized with `node`;
   *
   * @internal
   */
  protected _add(node: Node): Part<Node> {
    const part = new Part<Node>([node], this._cleanup.bind(this));

    this._parts.set(part, part);

    return part;
  }
}
