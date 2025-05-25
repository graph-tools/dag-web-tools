export interface SoftMaxParams {
  /**
   * Smoothing factor of softmax.
   *
   * As `smoothing -> 0`, the distribution becomes sharper.
   * As `smoothing -> inf` the distribution becomes more uniform.
   */
  smoothing: number;
}

export function softmax(
  values: number[],
  { smoothing = 1 }: Partial<SoftMaxParams> = {},
) {
  const max = values.reduce(
    (max, value) => (value > max ? value : max),
    -Infinity,
  );

  const exp = values.map((value) => Math.exp((value - max) / smoothing));
  const sum = exp.reduce((a, b) => a + b, 0);

  return exp.map((exp) => exp / sum);
}
