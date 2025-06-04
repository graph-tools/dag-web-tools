import {
  ReadonlyDirectedAcyclicGraph,
  ReadonlyPartition,
} from '../../../models';

import { EdgeWeightSelector, LeidenPartitioning } from '../types';

import {
  ConstantPottsPartition,
  ConstantPottsPartitioning,
} from '../ConstantPotts';

import { ReichardtBornholdtParams } from './types';

export class ReichardtBornholdtPartitioning<Node, Edge>
  extends ConstantPottsPartitioning<Node, Edge>
  implements LeidenPartitioning<Node, Edge>
{
  constructor({ resolution }: ReichardtBornholdtParams) {
    super({ resolution });
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

    let partSize = 0;
    for (const part of partition) {
      const partWeight = partition.data.get(part)!.weight;

      partSize = 0;

      for (const node of part) {
        const weight = partition.data.get(node)!.weight;

        partition.data.set(node, {
          size: weight,
          weight: weight,
        });
        partSize += weight;
      }

      partition.data.set(part, { size: partSize, weight: partWeight });
    }

    return new ConstantPottsPartition(weighted, {
      partition,
      resolution: this.resolution / (2 * weighted.size.weight),
    });
  }
}
