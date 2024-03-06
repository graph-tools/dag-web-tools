import { test, expect } from 'vitest';
import { add } from './add';
import mock from './mock.json';

mock.forEach((testCase) => {
  test(`adds ${testCase.a} + ${testCase.b} = ${testCase.ans}`, () => {
    expect(add(testCase.a, testCase.b)).toBe(testCase.ans);
  });
});
