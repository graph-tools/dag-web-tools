import { SubPartition } from '../../../SubPartition';
import { ForceMap } from '../../../utils';
import {
  ReadonlyWeightedDirectedAcyclicGraph,
  WeightedDirectedAcyclicGraph,
} from '../../../utils/WeightedDirectedAcyclicGraph';

import { AbstractLeidenPartition, AbstractLeidenSubPartition } from '../types';

import {
  ConstantPottsDataCollection,
  ConstantPottsPartitionOptions,
  ReadonlyConstantPottsDataCollection,
} from './types';
import {
  copyData,
  getGlobalParentPartition,
  getSingletonRootPartition,
  getSingletonSubPartition,
  PartitionWithConstantPottsData,
} from './utils';

export class ConstantPottsPartition<Node>
  extends SubPartition<Iterable<Node>>
  implements
    AbstractLeidenPartition<Iterable<Node>>,
    AbstractLeidenSubPartition<Iterable<Node>>
{
  /**
   * Contains Constant Potts Model data of the partition.
   * @internal
   */
  protected _data: ConstantPottsDataCollection<Iterable<Node>>;

  /**
   * Contains Constant Potts Model data of the parent partition.
   * @internal
   */
  protected _parentData: ConstantPottsDataCollection<Iterable<Node>>;

  /**
   * Contains resolution parameter of the ConstantPottsModel.
   * @internal
   */
  protected _resolution: number;

  constructor(
    public readonly graph: ReadonlyWeightedDirectedAcyclicGraph<Iterable<Node>>,
    {
      partition,
      parent,
      resolution = 1,
    }: Partial<ConstantPottsPartitionOptions<Iterable<Node>>> = {},
  ) {
    if (!partition || !parent) {
      if (!partition && parent) {
        partition = getSingletonSubPartition(graph, parent);
      } else if (partition && !parent) {
        parent = getGlobalParentPartition(partition, graph);
      } else {
        partition = getSingletonRootPartition(graph);
        parent = getGlobalParentPartition(partition, graph);
      }
    }

    super(partition, parent);

    this._data = copyData(partition, this);
    this._parentData = copyData(parent, this.parent);
    this._resolution = resolution;
  }

  /**
   * Contains Constant Potts Model data of the partition.
   */
  public get data(): ReadonlyConstantPottsDataCollection<Iterable<Node>> {
    return this._data;
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(n)` where
   * * n - number on nodes in the `partition`.
   */
  public sub(): AbstractLeidenSubPartition<Iterable<Node>> {
    return new ConstantPottsPartition(this.graph, {
      resolution: this._resolution,
      parent: this,
    });
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(n + e)` where
   * * n - number of nodes in the partition `graph`,
   * * e - number of edges in the partition `graph`.
   */
  public aggregated(): AbstractLeidenPartition<Iterable<Node>> {
    const aggregatedNodes = new ForceMap<
      ReadonlySet<Iterable<Node>>,
      Iterable<Node>
    >((part) => {
      const aggregatedNode: Node[] = [];

      for (const aggregated of part) {
        for (const node of aggregated) {
          aggregatedNode.push(node);
        }
      }

      return aggregatedNode;
    });

    const aggregatedGraph = new WeightedDirectedAcyclicGraph<Iterable<Node>>();

    for (const tailPart of this.parts()) {
      const edges = new ForceMap<Iterable<Node>, { weight: number }>(() => ({
        weight: 0,
      }));

      const aggregatedTail = aggregatedNodes.forceGet(tailPart);
      aggregatedGraph.add(aggregatedTail);

      for (const tail of tailPart) {
        for (const head of this.graph.childrenOf(tail)) {
          const weight = this.graph.edge(tail, head)!.data.weight;

          const aggregatedHead = aggregatedNodes.forceGet(this.get(head)!);
          aggregatedGraph.add(aggregatedHead);

          if (aggregatedTail !== aggregatedHead) {
            edges.forceGet(aggregatedHead).weight += weight;
          }
        }
      }

      for (const [aggregatedHead, edge] of edges.entries()) {
        aggregatedGraph.connect(aggregatedTail, aggregatedHead, edge);
      }
    }

    const aggregatedPartition = new PartitionWithConstantPottsData<
      Iterable<Node>
    >();

    for (const superpart of this.parent.parts()) {
      const aggregatedPart: Iterable<Node>[] = [];

      for (const part of this.subparts(superpart)) {
        const aggregatedNode = aggregatedNodes.forceGet(part);

        const partData = this._data.get(part)!;
        aggregatedPart.push(aggregatedNode);
        aggregatedPartition.data.set(aggregatedNode, {
          size: partData.size,
          weight: partData.weight,
        });
      }

      const superpartData = this._parentData.get(superpart)!;
      aggregatedPartition.push(aggregatedPart);
      aggregatedPartition.data.set(aggregatedPart, {
        size: superpartData.size,
        weight: superpartData.weight,
      });
    }

    return new ConstantPottsPartition(aggregatedGraph, {
      partition: aggregatedPartition,
      resolution: this._resolution,
    });
  }

  /**
   * @inheritdoc
   *
   * Time complexity (V8): `O(n)` where
   * * n - number on nodes in the `dest`.
   */
  public diff(node: Iterable<Node>, dest: ReadonlySet<Iterable<Node>>): number {
    if (!this.has(node)) return 0;

    let base;
    if ((base = this._index.get(node)!) === dest) {
      return 0;
    }

    const baseSize = this._data.get(base)!.size;
    const destSize = this._data.get(dest)?.size ?? 0;

    const nodeBaseWeight = this._data.get(node)!.weight;

    let nodeDestWeight = 0;
    for (const neighbour of dest) {
      nodeDestWeight +=
        (this.graph.edge(node, neighbour)?.data.weight ?? 0) +
        (this.graph.edge(neighbour, node)?.data.weight ?? 0);
    }

    return (
      nodeDestWeight -
      nodeBaseWeight -
      this._resolution * (destSize - baseSize + 1)
    );
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(1)`.
   */
  public connected(
    item: Iterable<Node> | ReadonlySet<Iterable<Node>>,
  ): boolean {
    if (!this.has(item)) return false;

    let itemData, parentData;
    if (this._index.has(item as Iterable<Node>)) {
      const node = item as Iterable<Node>;
      itemData = this._data.get(item)!;
      parentData = this._data.get(this.get(node)!)!;
    } else {
      const part = item as ReadonlySet<Iterable<Node>>;
      itemData = this._data.get(item)!;
      parentData = this._parentData.get(this.superpart(part)!)!;
    }

    return (
      itemData.weight >=
      this._resolution * itemData.size * (parentData.size - itemData.size)
    );
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(n)` where
   * * n - number of nodes in affected area.
   */
  public move(
    node: Iterable<Node>,
    part: ReadonlySet<Iterable<Node>>,
  ): boolean {
    const base = this.get(node);

    if (!super.move(node, part)) return false;

    const baseData = this._data.get(base!);
    const nodeData = this._data.get(node)!;
    const destData = this._data.get(part)!;

    const baseWeight = nodeData.weight;
    if (baseData) {
      for (const neighbour of base!) {
        this._data.get(neighbour)!.weight -=
          (this.graph.edge(node, neighbour)?.data.weight ?? 0) +
          (this.graph.edge(neighbour, node)?.data.weight ?? 0);
      }
    }

    let weight = 0;
    let destWeight = 0;
    for (const neighbour of part) {
      weight =
        (this.graph.edge(node, neighbour)?.data.weight ?? 0) +
        (this.graph.edge(neighbour, node)?.data.weight ?? 0);

      this._data.get(neighbour)!.weight += weight;
      destWeight += weight;
    }

    const outerWeight =
      this._parentData.get(node)!.weight - baseWeight - destWeight;

    if (baseData) {
      baseData.size -= nodeData.size;
      baseData.weight -= outerWeight;
    }
    destData.size += nodeData.size;
    destData.weight += outerWeight;

    nodeData.weight = destWeight;

    return true;
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(1)`.
   */
  protected _cleanup(
    part: ReadonlySet<Iterable<Node>>,
    value: Iterable<Node>,
  ): void {
    super._cleanup(part, value);
    this._data.delete(part);
  }

  /**
   * @inheritdoc
   *
   * Also maintain Constant Potts Model data.
   *
   * Time complexity (V8): `O(1)`.
   */
  protected _add(node: Iterable<Node>) {
    const part = super._add(node);

    this._data?.set(part, { size: 0, weight: 0 });

    return part;
  }
}
