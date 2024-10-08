export class ProxyIterableIterator<T, S = T> implements IterableIterator<T> {
  protected _source;
  protected _mapper;

  constructor(source: IterableIterator<S>, mapper: (item: S) => T) {
    this._source = source;
    this._mapper = mapper;
  }

  [Symbol.iterator]() {
    return this;
  }

  next() {
    const { value, done } = this._source.next();
    return { done, value: done ? value : this._mapper(value) };
  }
}

export class ProxyReadonlySet<T, S> implements ReadonlySet<T> {
  protected _source;
  protected _encoder;
  protected _decoder;

  constructor(
    source: ReadonlySet<S>,
    encoder: (item: S) => T,
    decoder: (item: T) => S,
  ) {
    this._source = source;
    this._encoder = encoder;
    this._decoder = decoder;
  }

  [Symbol.iterator]() {
    return this.keys();
  }

  get size(): number {
    return this._source.size;
  }

  public has(item: T): boolean {
    return this._source.has(this._decoder(item));
  }

  public keys(): IterableIterator<T> {
    return new ProxyIterableIterator<T, S>(this._source.keys(), this._encoder);
  }

  public values(): IterableIterator<T> {
    return this.keys();
  }

  public entries(): IterableIterator<[T, T]> {
    return new ProxyIterableIterator<[T, T], [S, S]>(
      this._source.entries(),
      (item: [S, S]) => [this._encoder(item[0]), this._encoder(item[1])],
    );
  }

  public forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void {
    this._source.forEach(
      (value: S, value2: S) =>
        callbackfn(this._encoder(value), this._encoder(value2), this),
      thisArg,
    );
  }
}
