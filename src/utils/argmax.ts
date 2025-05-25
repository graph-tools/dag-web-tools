export function argmaxx<T>(
  func: (arg: T) => number,
  args: Iterable<T>,
): [T, number] {
  let argmax: T | undefined = undefined;
  let max: number = -Infinity;

  let value: number;
  for (const arg of args) {
    if ((value = func(arg)) <= max) continue;

    max = value;
    argmax = arg;
  }

  if (argmax === undefined) throw new Error();
  return [argmax, max];
}

export function argmax<T>(func: (arg: T) => number, args: Iterable<T>): T {
  return argmaxx(func, args)[0];
}
