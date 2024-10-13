import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from './components/FlowCanvas';
import 'reactflow/dist/style.css';
import 'antd/dist/reset.css';

function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
