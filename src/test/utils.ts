import { MockEdge, MockNode } from '.';

export function getMockNode(): MockNode {
  return {};
}

export function getMockNodes(count: number): MockNode[] {
  const nodes: MockNode[] = [];
  for (let i = 0; i < count; ++i) nodes.push(getMockNode());
  return nodes;
}

export function getMockEdge(): MockEdge {
  return {};
}

type EqualOptions<T> = {
  equal: (a: T, b: T) => boolean;
};

export function areSetsEqual<T>(
  a: ReadonlySet<T>,
  b: ReadonlySet<T>,
  options: EqualOptions<T> = { equal: (a, b) => a === b },
) {
  return (
    a.size === b.size &&
    [...a].every((a) => [...b].some((b) => options.equal(a, b)))
  );
}

export function areMultisetsEqual<T>(
  a: ReadonlyArray<T>,
  b: ReadonlyArray<T>,
  options: EqualOptions<T> = { equal: (a, b) => a === b },
) {
  return a.length === b.length && areSetsEqual(new Set(a), new Set(b), options);
}
