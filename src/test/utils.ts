import { MockNode } from '.';

export function getMockNode(): MockNode {
  return {};
}

export function getMockNodes(count: number): MockNode[] {
  const nodes: MockNode[] = [];
  for (let i = 0; i < count; ++i) nodes.push(getMockNode());
  return nodes;
}

export function areSetsEqual<T>(a: ReadonlySet<T>, b: ReadonlySet<T>) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}
