import { UnmatchedPartitionError } from '../../../exeptions';
import {
  ReadonlyDirectedAcyclicGraph,
  ReadonlyPartition,
} from '../../../models';
import { ForceMap } from '../../../utils';
import { WeightedDirectedAcyclicGraph } from '../../../utils/WeightedDirectedAcyclicGraph';

import { EdgeWeightSelector, LeidenPartitioning } from '../types';

import { ConstantPottsPartition } from './ConstantPottsPartition';
import { ConstantPottsData, ConstantPottsParams } from './types';
import { PartitionWithConstantPottsData } from './utils';

export class ConstantPottsPartitioning<Node, Edge>
  implements LeidenPartitioning<Node, Edge>
{
  public readonly resolution: number;

  constructor({ resolution }: ConstantPottsParams) {
    this.resolution = resolution;
  }

  /**
   * @inheritdoc
   *
   * Time Complexity (V8): O(n + e), where
   * * n - number on nodes in `graph`,
   * * e - number on edges in `graph`.
   */
  public init(
    graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
    initialPartition: ReadonlyPartition<Node>,
    edgeWeightSelector: EdgeWeightSelector<Node>,
  ): ConstantPottsPartition<Node> {
    const [weighted, partition] = this.wrap(
      graph,
      initialPartition,
      edgeWeightSelector,
    );

    return new ConstantPottsPartition(weighted, {
      partition,
      resolution: this.resolution,
    });
  }

  protected wrap(
    graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
    initialPartition: ReadonlyPartition<Node>,
    edgeWeightSelector: EdgeWeightSelector<Node>,
  ): [
    graph: WeightedDirectedAcyclicGraph<Iterable<Node>>,
    PartitionWithConstantPottsData<Iterable<Node>>,
  ] {
    const nodes = new ForceMap((node: Node) => [node]);
    const parts = new ForceMap((part: Iterable<Node>) => {
      const wrapped = [];
      for (const node of part) {
        wrapped.push(nodes.forceGet(node));
      }
      return wrapped;
    });

    const data = new ForceMap<Node[] | Node[][], ConstantPottsData>((item) => ({
      size: item.length,
      weight: 0,
    }));

    const weighted = new WeightedDirectedAcyclicGraph<Iterable<Node>>();

    let tailPart, headPart;
    for (const tail of graph.nodes) {
      if (!(tailPart = initialPartition.get(tail)))
        throw new UnmatchedPartitionError();

      const wrappedTail = nodes.forceGet(tail);
      const wrappedTailPart = parts.forceGet(tailPart);
      const wrappedTailData = data.forceGet(wrappedTail);
      const wrappedTailPartData = data.forceGet(wrappedTailPart);

      weighted.add(wrappedTail);

      for (const head of graph.childrenOf(tail)) {
        if (!(headPart = initialPartition.get(head)))
          throw new UnmatchedPartitionError();

        const wrappedHead = nodes.forceGet(head);
        const wrappedHeadPart = parts.forceGet(headPart);
        const wrappedHeadData = data.forceGet(wrappedHead);
        const wrappedHeadPartData = data.forceGet(wrappedHeadPart);

        const weight = edgeWeightSelector(tail, head);

        weighted.connect(wrappedTail, wrappedHead, {
          weight,
        });

        if (wrappedTailPart === wrappedHeadPart) {
          wrappedTailData.weight += weight;
          wrappedHeadData.weight += weight;
        } else {
          wrappedTailPartData.weight += weight;
          wrappedHeadPartData.weight += weight;
        }
      }
    }

    return [
      weighted,
      new PartitionWithConstantPottsData(parts.values(), data),
    ] as const;
  }
}
