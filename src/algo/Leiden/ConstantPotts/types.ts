export interface ConstantPottsParams {
  /**
   * Contains resolution parameter of the model.
   */
  resolution: number;
}

export interface ConstantPottsData {
  /**
   * Recursive size (|.|) of the node.
   * let N = { A, B, ... } then |N| = |A| + |B| + ... .
   */
  size: number;

  /**
   * Local weigth (E(n, P)) of the node.
   * let P1 = { n1, n2, ... } then E(P1, P2) = E(n1, P2) + E(n2, P2) + ... .
   */
  weight: number;
}

export interface ReadonlyConstantPottsDataCollection<Node>
  extends ReadonlyMap<Node | Iterable<Node>, ConstantPottsData> {}

export interface ConstantPottsDataCollection<Node>
  extends Map<Node | Iterable<Node>, ConstantPottsData> {}

export interface ReadonlyPartitionWithConstantPottsData<Node>
  extends Iterable<Iterable<Node>> {
  /**
   * Contains Constant Potts Model data for both nodes and parts of the partition.
   */
  readonly data: ReadonlyConstantPottsDataCollection<Node | Iterable<Node>>;
}

export interface ConstantPottsPartitionOptions<Node>
  extends ConstantPottsParams {
  /**
   * Contains actual partition and its data.
   */
  partition: ReadonlyPartitionWithConstantPottsData<Node>;

  /**
   * Contains parent partition and its data.
   */
  parent: ReadonlyPartitionWithConstantPottsData<Node>;
}
