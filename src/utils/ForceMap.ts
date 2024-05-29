/**
 * Regular map containing forceful methods.
 */
export class ForceMap<K, V> extends Map<K, V> {
  /**
   * Contains getter of default value.
   */
  _getDefault: () => V;

  /**
   * Creates ForceMap.
   *
   * @param getDefault - Function to be generator of default value.
   * @param iterable - Iterable object to be passed into map's constructor.
   */
  constructor(getDefault: () => V, iterable?: Iterable<[K, V]>) {
    super(iterable);
    this._getDefault = getDefault;
  }

  /**
   * Regular get function, but if the key is missing, it will be created with the default value.
   *
   * @param key - Requested value key.
   *
   * @returns Value associated with the `key` if it exists, default value otherwise.
   */
  forceGet(key: K): V {
    if (!this.has(key)) this.set(key, this._getDefault());
    return this.get(key)!;
  }
}
