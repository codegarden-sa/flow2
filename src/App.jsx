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
  group: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, backgroundColor: 'rgba(240,240,240,0.5)' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{data.label}</div>
      {data.children}
    </div>
  ),
};

const initialNodes = [
  {
    id: 'start',
    type: 'textInput',
    position: { x: 0, y: 0 },
    data: { label: 'Start Node' },
  },
];

const initialEdges = [];

function FlowWithCustomNodes() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [groupCounter, setGroupCounter] = useState(0);
  const reactFlowInstance = useReactFlow();

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDeleteNode = useCallback((id) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find(n => n.id === id);
      if (nodeToDelete && nodeToDelete.parentId) {
        const parentGroup = nds.find(n => n.id === nodeToDelete.parentId);
        const updatedParentChildren = parentGroup.data.children.filter(childId => childId !== id);
        
        if (updatedParentChildren.length === 0) {
          // If this was the last child, remove both the node and the parent group
          return nds.filter(n => n.id !== id && n.id !== nodeToDelete.parentId);
        } else {
          // Otherwise, update the parent's children array
          return nds.map(n => {
            if (n.id === nodeToDelete.parentId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  children: updatedParentChildren
                }
              };
            }
            return n;
          }).filter(n => n.id !== id);
        }
      }
      // If it's not in a group, just remove the node
      return nds.filter(n => n.id !== id);
    });
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

      // Check if the node is being dropped onto an existing group
      const droppedOnGroup = nodes.find(node => 
        node.type === 'group' &&
        position.x >= node.position.x &&
        position.x <= node.position.x + node.style.width &&
        position.y >= node.position.y &&
        position.y <= node.position.y + node.style.height
      );

      const newNodeId = `${type}-${nodes.length + 1}`;

      if (droppedOnGroup) {
        // If dropped on an existing group, add it to that group
        const newNode = {
          id: newNodeId,
          type,
          position: {
            x: position.x - droppedOnGroup.position.x,
            y: position.y - droppedOnGroup.position.y,
          },
          data: { label, onDelete: onDeleteNode },
          parentId: droppedOnGroup.id,
          extent: 'parent',
        };

        setNodes(nds => nds.map(n => {
          if (n.id === droppedOnGroup.id) {
            return {
              ...n,
              data: {
                ...n.data,
                children: [...(n.data.children || []), newNodeId],
              },
            };
          }
          return n;
        }).concat(newNode));
      } else {
        // If dropped on empty canvas, create a new group
        const newGroupId = `group-${groupCounter + 1}`;
        setGroupCounter(prev => prev + 1);
        
        const newGroup = {
          id: newGroupId,
          type: 'group',
          position: { x: position.x - 50, y: position.y - 50 },
          style: { width: 300, height: 300 },
          data: { label: `Group ${groupCounter + 1}`, children: [newNodeId] },
        };

        const newNode = {
          id: newNodeId,
          type,
          position: { x: 50, y: 50 }, // Position within the group
          data: { label, onDelete: onDeleteNode },
          parentId: newGroupId,
          extent: 'parent',
        };

        setNodes(nds => [...nds, newGroup, newNode]);
      }
    },
    [reactFlowInstance, nodes, setNodes, onDeleteNode, groupCounter]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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