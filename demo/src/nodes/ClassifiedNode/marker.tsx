import React, { memo } from 'react';

import * as T from './types';

/** Variant count of each feature should be unique prime number */
/** 2 */
const stroke = [0, 64];

/** 5 */
const shapes = [
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <rect x="200" y="200" width="400" height="400" />
  </svg>,
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <circle cx="400" cy="400" r="200" />
  </svg>,
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <rect
      transform="translate(0 0) rotate(45) skewX(0) skewY(0) scale(1)"
      transform-origin="400 400"
      x="200"
      y="200"
      width="400"
      height="400"
    />
  </svg>,
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <polygon points="120,600 400,120 680,600" />
  </svg>,
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <polygon points="150,535 150,255 400,100 650,255 650,535 400,700" />
  </svg>,
];

/** 7 */
const colors = [
  '#ff3f3f',
  '#ffcc06',
  '#0a9ad7',
  '#9ad70a',
  '#d70a9a',
  '#3a329f',
  '#111111',
];

export const EquivalenceClassMarker = memo(
  ({ num, className }: T.EquivalenceClassMarkerProps) => {
    return (
      <div
        style={{
          fill: num % 2 === 0 ? colors[num % colors.length] : 'transparent',
          strokeWidth: stroke[num % 2],
          stroke: colors[num % colors.length],
        }}
        className={className}
      >
        {shapes[num % shapes.length]}
      </div>
    );
  },
);
