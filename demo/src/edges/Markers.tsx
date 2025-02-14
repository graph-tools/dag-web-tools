import React from 'react';

export const Markers = () => (
  <svg
    style={{ position: 'absolute', top: 0, left: 0 }}
    viewBox="0 0 300 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
        stroke="gray"
        fill="gray"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker
        id="arrow_selected"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
        stroke="black"
        fill="black"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker
        id="arrow_active"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
        stroke="blue"
        fill="blue"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker
        id="arrow_inactive"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
        stroke="lightgray"
        fill="lightgray"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
  </svg>
);
