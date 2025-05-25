export class ReadonlySetView<T> implements ReadonlySet<T> {
  constructor(private map: ReadonlyMap<T, unknown>) {}

  [Symbol.iterator]() {
    return this.map.keys();
  }

  get size() {
    return this.map.size;
  }

  has(value: T): boolean {
    return this.map.has(value);
  }

  keys(): SetIterator<T> {
    return this.map.keys();
  }

  values(): SetIterator<T> {
    return this.map.keys();
  }

  *entries(): SetIterator<[T, T]> {
    for (const key of this.map.keys()) {
      yield [key, key];
    }
  }

  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void {
    this.map.forEach((_, key) => callbackfn(key, key, this), thisArg);
  }
}
