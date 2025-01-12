import { ForceMap } from './ForceMap';

class TrieNode<K, V> {
  next = new ForceMap<K, TrieNode<K, V>>(() => new TrieNode());
  value?: V;
}

export class Trie<K, V> {
  private root: TrieNode<K, V>;

  constructor() {
    this.root = new TrieNode();
  }

  public get(key: Iterable<K>): V | undefined {
    let node: TrieNode<K, V> | undefined = this.root;
    for (const sym of key) {
      if (node === undefined) {
        return undefined;
      }
      node = node.next.get(sym);
    }
    return node?.value;
  }

  public set(key: Iterable<K>, value: V): V {
    let node: TrieNode<K, V> = this.root;
    for (const sym of key) {
      node = node.next.forceGet(sym);
    }
    node.value = value;
    return value;
  }
}
