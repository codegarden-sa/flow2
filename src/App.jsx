import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        <Sidebar />
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}