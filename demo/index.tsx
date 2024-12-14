import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './index.css';

import { DirectedAcyclicGraphProvider, GroupProvider } from '@demo/contexts';

import { Demo } from './Demo';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <DirectedAcyclicGraphProvider>
    <GroupProvider>
      <ReactFlowProvider>
        <Demo />
      </ReactFlowProvider>
    </GroupProvider>
  </DirectedAcyclicGraphProvider>,
);
