import { useCallback } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useMerged<T extends any[]>(...fns: ((...args: T) => void)[]) {
  const merged = useCallback(
    (...args: T) => fns.forEach((fn) => fn(...args)),
    fns,
  );
  return merged;
}
