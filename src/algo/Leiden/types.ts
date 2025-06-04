import {
  AbstractPartition,
  AbstractSubPartition,
  ReadonlyDirectedAcyclicGraph,
  ReadonlyPartition,
  ReadonlySubPartition,
} from '../../models';
import { ReadonlyWeightedDirectedAcyclicGraph } from '../../utils/WeightedDirectedAcyclicGraph';

export type EdgeWeightSelector<Node> = (tail: Node, head: Node) => number;

export type LeidenOptions<Node, Edge> = {
  /**
   * Partition that will be used as initial.
   */
  initialPartition: ReadonlyPartition<Node>;

  /**
   * Type of partitioning that algorithm will use.
   */
  partitioning: LeidenPartitioning<Node, Edge>;

  /**
   * Max number of algorithm iterations.
   */
  iterations: number;

  /**
   * Smoothing parameter for softmax (used at refine choose step).
   *
   * As `smoothing -> 0` choice becomes closely to argmax.
   * As `smoothing -> inf` choice becomes closely to random.
   */
  smoothing: number;
};

export interface ReadonlyLeidenPartition<Node> extends ReadonlyPartition<Node> {
  readonly graph: ReadonlyWeightedDirectedAcyclicGraph<Node>;

  /**
   * Calculated quality function difference of the `node` movement.
   *
   * @param node - Node to be moved.
   * @param part - Destination part.
   *
   * @returns Quality function diff of the movement.
   */
  diff(node: Node, part: ReadonlySet<Node>): number;

  /**
   * Checks if the `node` is well connected in its part.
   *
   * @param node - Node to be checked.
   *
   * @returns `true` if `node` is well connected, `false` otherwise.
   */
  connected(node: Node): boolean;

  /**
   * Creates singleton (each node in other part) partition base on this partition.
   *
   * @returns Singleton partition.
   */
  sub(): AbstractLeidenSubPartition<Node>;
}

export interface AbstractLeidenPartition<Node>
  extends ReadonlyLeidenPartition<Node>,
    AbstractPartition<Node> {}

export interface ReadonlyLeidenSubPartition<Node>
  extends ReadonlySubPartition<Node> {
  readonly graph: ReadonlyWeightedDirectedAcyclicGraph<Node>;

  /**
   * Calculated quality function difference of the `node` movement.
   *
   * @param node - Node to be moved.
   * @param part - Destination part.
   *
   * @returns Quality function diff of the movement.
   */
  diff(node: Node, part: ReadonlySet<Node>): number;

  /**
   * Checks if the `part` is well connected in its superpart.
   *
   * @param part - Part to be checked.
   *
   * @returns `true` if `node` is well connected, `false` otherwise.
   */
  connected(part: ReadonlySet<Node>): boolean;

  /**
   * Aggregates graph. Each part merges into one node, similarly the edges merge by summing the weights.
   * Aggregated graph partitioning is similar to the parent partitioning.
   *
   * @returns Aggregated graph partitioning.
   */
  aggregated(): AbstractLeidenPartition<Node>;
}

export interface AbstractLeidenSubPartition<Node>
  extends ReadonlyLeidenSubPartition<Node>,
    AbstractSubPartition<Node> {}

export interface LeidenPartitioning<Node, Edge> {
  /**
   * Initializes partitioning type. Creates partitioning to be used in Leiden algorithm steps.
   *
   * @param graph - Initial graph.
   * @param initialPartition - Initial partition of the `graph`.
   * @param edgeWeightSelector - Weight function over graph edges.
   *
   * @returns Ready to use Leiden partition.
   */
  init(
    graph: ReadonlyDirectedAcyclicGraph<Node, Edge>,
    initialPartition: ReadonlyPartition<Node>,
    edgeWeightSelector: EdgeWeightSelector<Node>,
  ): AbstractLeidenPartition<Iterable<Node>>;
}

export type ChooseData<Node> = {
  /**
   * Contains parts to choose from.
   */
  parts: ReadonlySet<Node>[];

  /**
   * Contains quality function diff for each part.
   */
  diffs: number[];
};
