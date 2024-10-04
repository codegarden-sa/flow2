// App.js
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Handle,
  useReactFlow,
  MiniMap,
  Background,
  Controls,
  NodeToolbar,
  Panel,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { Button, Input } from 'antd';
import 'antd/dist/reset.css'; 
import 'reactflow/dist/style.css';// Updated import for Ant Design CSS
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';

const initialNodes = [
  {
    id: 'start',
    type: 'input', // Default node type
    data: { label: 'Start' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges = [];

const CustomTextInputNode = ({ data, id }) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy node', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5' }}>
        <strong>{data.label}</strong>
        <div>
          <Input
            placeholder="Type your answer"
            style={{ marginTop: 5, width: '100%' }}
          />
        </div>
        <Handle type="source" position="right" />
        <Handle type="target" position="left" />
      </div>
    </>
  );
};

const CustomQuickReplyNode = ({ data, id }) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy node', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5' }}>
        <strong>{data.label}</strong>
        <div>
          <Button style={{ marginRight: 5 }}>Yes</Button>
          <Button>No</Button>
        </div>
        <Handle type="source" position="right" />
        <Handle type="target" position="left" />
      </div>
    </>
  );
};

const CustomConditionNode = ({ data, id }) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy node', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5' }}>
        <strong>{data.label}</strong>
        <div>If condition is met</div>
        <Handle type="source" position="right" />
        <Handle type="target" position="left" />
      </div>
    </>
  );
};

const CustomDelayNode = ({ data, id }) => {
  return (
    <>
    <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy node', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5' }}>
        <strong>{data.label}</strong>
      <div>Wait for X seconds</div>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
    </>
  );
};

const nodeTypes = {
  textInput: CustomTextInputNode,
  quickReply: CustomQuickReplyNode,
  condition: CustomConditionNode,
  delay: CustomDelayNode,
};

function FlowWithCustomNodes() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const setToolbarPosition = useCallback(
    (pos) =>
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, toolbarPosition: pos },
        }))
      ),
    [setNodes]
  );

  const setToolbarVisibility = useCallback(
    (visible) =>
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, toolbarVisible: visible },
        }))
      ),
    [setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label, onDelete: onDeleteNode },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, onDeleteNode]
  );

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeColor = (node) => {
    switch (node.type) {
      case 'input':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ width: '250px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h3>Pre-built Nodes</h3>
        <div
          onDragStart={(event) => onDragStart(event, 'textInput', 'Text Input')}
          draggable
          style={{ marginBottom: '10px', cursor: 'move' }}
        >
          <Button block>Text Input Node</Button>
        </div>
        <div
          onDragStart={(event) => onDragStart(event, 'quickReply', 'Quick Reply')}
          draggable
          style={{ marginBottom: '10px', cursor: 'move' }}
        >
          <Button block>Quick Reply Node</Button>
        </div>
        <div
          onDragStart={(event) => onDragStart(event, 'condition', 'Condition')}
          draggable
          style={{ marginBottom: '10px', cursor: 'move' }}
        >
          <Button block>Condition Node</Button>
        </div>
        <div
          onDragStart={(event) => onDragStart(event, 'delay', 'Delay')}
          draggable
          style={{ marginBottom: '10px', cursor: 'move' }}
        >
          <Button block>Delay Node</Button>
        </div>
      </div>
      <div style={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
          <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <FlowWithCustomNodes />
      </div>
    </ReactFlowProvider>
  );
}