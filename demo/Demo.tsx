import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Markers } from '@demo/edges';
import {
  BreadthFirstIteratorPage,
  DepthFirstIteratorPage,
  EquivalentNodesPage,
  IndexPage,
  PlanarizationPage,
  TopologicalIteratorPage,
} from '@demo/pages';

export const Demo = () => {
  return (
    <>
      <Markers />
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/iterator" element={<TopologicalIteratorPage />} />
          <Route path="/iterator/bfs" element={<BreadthFirstIteratorPage />} />
          <Route path="/iterator/dfs" element={<DepthFirstIteratorPage />} />
          <Route path="/nodes/equivalent" element={<EquivalentNodesPage />} />
          <Route path="/layout/planarization" element={<PlanarizationPage />} />
        </Routes>
      </Router>
    </>
  );
};
