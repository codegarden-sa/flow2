// App.js
import React, { useState, useCallback, useEffect, useMemo, forwardRef } from 'react';
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
  applyNodeChanges,
  useViewport,
} from 'reactflow';
import { Button, Input, Card } from 'antd';
import 'antd/dist/reset.css'; 
import 'reactflow/dist/style.css';// Updated import for Ant Design CSS
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Define constants for node and group dimensions
const NODE_WIDTH = 230;
const NODE_HEIGHT = 80;
const GROUP_PADDING = 10;
const LABEL_HEIGHT = 30; // Fixed height for the label
const GROUP_WIDTH = 250;
const INITIAL_GROUP_HEIGHT = 150; // Adjusted for better visibility
const VERTICAL_NODE_SPACING = 20; // New constant for vertical spacing between nodes
const GROUP_HEIGHT = 50;
const EXPANDED_GROUP_WIDTH = 300;
const EXPANDED_GROUP_HEIGHT = 250;

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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#e6ffcc', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div>
          <Input
            placeholder="Type your answer"
            style={{ marginTop: 5, width: '100%', padding: '5px' }}
          />
        </div>
        <Handle type="source" position="right" style={{ top: '50%' }} />
        <Handle type="target" position="left" style={{ top: '50%' }} />
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5', width: NODE_WIDTH }}>
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5', width: NODE_WIDTH }}>
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
      <div>Wait for X seconds</div>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
    </>
  );
};

const GroupNode = forwardRef(({ data }, ref) => {
  return (
    <motion.div ref={ref}>
      <div 
        style={{ 
          height: `${LABEL_HEIGHT}px`, 
          borderRadius: '5px',
          padding: '5px 10px', 
          fontWeight: 'bold', 
          backgroundColor: 'pink',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {data.label}
      </div>
      <motion.div 
        style={{ 
          flex: 1, 
          padding: GROUP_PADDING,
          position: 'relative'
        }}
      >
        <AnimatePresence>
          {data.isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                color: 'rgba(0,0,0,0.3)'
              }}
            >
              Drop here
            </motion.div>
          )}
        </AnimatePresence>
        {data.children}
      </motion.div>
    </motion.div>
  );
});

const AnimatedCustomTextInputNode = motion.create(CustomTextInputNode);

const StartNode = ({ data }) => {
  return (
    <Card
      style={{
        width: 120,
        height: NODE_HEIGHT,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6ede87',
        border: '2px solid #4caf50',
      }}
    >
      <strong>{data.label}</strong>
      <Handle
        type="source"
        position="right"
        id="start-handle"
        style={{ bottom: '-5px', right: '-5px' }}
      />
    </Card>
  );
};

const initialNodes = [
  {
    id: 'start',
    type: 'start',
    position: { x: 50, y: 50 }, // Adjust these values to position the node in the top-left
    data: { label: 'Start' },
  },
];

const initialEdges = [];

function FlowWithCustomNodes() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [groupCounter, setGroupCounter] = useState(0);
  const reactFlowInstance = useReactFlow();
  const { x, y, zoom } = useViewport();

  const updateGroupDimensions = useCallback((groupId) => {
    setNodes(nds => {
      const group = nds.find(n => n.id === groupId);
      if (!group) return nds;

      const childNodes = nds.filter(n => n.parentId === groupId);
      if (childNodes.length === 0) return nds;

      const maxY = Math.max(...childNodes.map(n => n.position.y + NODE_HEIGHT));
      const newHeight = Math.max(INITIAL_GROUP_HEIGHT, maxY + GROUP_PADDING);

      return nds.map(n => n.id === groupId ? {
        ...n,
        style: { ...n.style, height: newHeight },
        data: { ...n.data, height: newHeight }
      } : n);
    });
  }, [setNodes]);

  const getNextChildPosition = useCallback((groupId) => {
    const childNodes = nodes.filter(n => n.parentId === groupId);
    if (childNodes.length === 0) {
      return { x: GROUP_PADDING, y: GROUP_PADDING + (INITIAL_GROUP_HEIGHT * (LABEL_HEIGHT / 100)) };
    }
    const maxY = Math.max(...childNodes.map(n => n.position.y + NODE_HEIGHT));
    return { x: GROUP_PADDING, y: maxY + VERTICAL_NODE_SPACING };
  }, [nodes]);

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
          const updatedNodes = nds.map(n => {
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

          // Schedule an update of the group dimensions
          setTimeout(() => updateGroupDimensions(nodeToDelete.parentId), 0);

          return updatedNodes;
        }
      }
      // If it's not in a group, just remove the node
      return nds.filter(n => n.id !== id);
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges, updateGroupDimensions]);

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
        position.x <= node.position.x + GROUP_WIDTH &&
        position.y >= node.position.y &&
        position.y <= node.position.y + node.style.height
      );

      const newNodeId = `${type}-${nodes.length + 1}`;

      if (droppedOnGroup) {
        // If dropped on an existing group, add it to that group
        const newNodePosition = getNextChildPosition(droppedOnGroup.id);
        const newNode = {
          id: newNodeId,
          type,
          position: newNodePosition,
          data: { label, onDelete: onDeleteNode },
          parentId: droppedOnGroup.id,
          extent: 'parent',
          style: { width: NODE_WIDTH } // Use the constant NODE_WIDTH
        };

        setNodes(nds => nds.map(n => {
          if (n.id === droppedOnGroup.id) {
            return {
              ...n,
              data: {
                ...n.data,
                isExpanded: false // Reset expansion after drop
              },
            };
          }
          return n;
        }).concat(newNode));

        setTimeout(() => updateGroupDimensions(droppedOnGroup.id), 0);
      } else {
        // If dropped on empty canvas, create a new group
        const newGroupId = `group-${groupCounter + 1}`;
        setGroupCounter(prev => prev + 1);
        
        const newGroup = {
          id: newGroupId,
          type: 'group',
          position: position,
          style: { width: GROUP_WIDTH, height: INITIAL_GROUP_HEIGHT, backgroundColor: '#E6E6FA' },
          data: { 
            label: `Group ${groupCounter + 1}`, 
            height: INITIAL_GROUP_HEIGHT
          },
        };

        const newNode = {
          id: newNodeId,
          type,
          position: { x: GROUP_PADDING, y: GROUP_PADDING + (INITIAL_GROUP_HEIGHT * (LABEL_HEIGHT / 100)) },
          data: { label, onDelete: onDeleteNode },
          parentId: newGroupId,
          extent: 'parent',
          style: { width: NODE_WIDTH } // Use the constant NODE_WIDTH
        };

        setNodes(nds => [...nds, newGroup, newNode]);
      }
    },
    [reactFlowInstance, nodes, setNodes, onDeleteNode, groupCounter, updateGroupDimensions, getNextChildPosition]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const groupNode = nodes.find(n => 
      n.type === 'group' &&
      event.clientX > n.position.x &&
      event.clientX < n.position.x + (n.data.isExpanded ? EXPANDED_GROUP_WIDTH : GROUP_WIDTH) &&
      event.clientY > n.position.y &&
      event.clientY < n.position.y + (n.data.isExpanded ? EXPANDED_GROUP_HEIGHT : GROUP_HEIGHT)
    );

    setNodes(nds => nds.map(n => 
      n.type === 'group' ? { ...n, data: { ...n.data, isExpanded: n.id === groupNode?.id } } : n
    ));
  }, [nodes, setNodes]);

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

  const fitViewOptions = {
    padding: 0.2,
    minZoom: 0.5,
    maxZoom: 1,
    duration: 800,
    includeHiddenNodes: false,
  };

  const updateNodePositions = useCallback((movedNodeId, newY) => {
    setNodes(currentNodes => {
      const movedNode = currentNodes.find(n => n.id === movedNodeId);
      if (!movedNode || !movedNode.parentId) return currentNodes;

      const parentNode = currentNodes.find(n => n.id === movedNode.parentId);
      const siblingNodes = currentNodes.filter(n => n.parentId === movedNode.parentId && n.id !== movedNodeId);

      // Sort siblings by vertical position
      siblingNodes.sort((a, b) => a.position.y - b.position.y);

      let updatedNodes = [...currentNodes];
      let currentY = LABEL_HEIGHT + GROUP_PADDING;

      siblingNodes.forEach(node => {
        if (node.id === movedNodeId) {
          node.position.y = newY;
        }

        if (node.position.y < currentY) {
          node.position.y = currentY;
        }

        currentY = node.position.y + NODE_HEIGHT + VERTICAL_NODE_SPACING;
      });

      // Ensure the parent container is tall enough
      const maxY = Math.max(...siblingNodes.map(n => n.position.y + NODE_HEIGHT));
      const newParentHeight = Math.max(INITIAL_GROUP_HEIGHT, maxY + GROUP_PADDING);

      updatedNodes = updatedNodes.map(n => 
        n.id === parentNode.id 
          ? { ...n, style: { ...n.style, height: newParentHeight } }
          : n
      );

      return updatedNodes;
    });
  }, [setNodes]);

  const customOnNodesChange = useCallback((changes) => {
    const modifiedChanges = changes.map((change) => {
      if (change.type === 'position' && change.dragging) {
        const node = nodes.find((n) => n.id === change.id);
        if (node && node.parentId) {
          const parentNode = nodes.find((n) => n.id === node.parentId);
          if (parentNode) {
            const newY = Math.max(
              LABEL_HEIGHT + GROUP_PADDING,
              Math.min(
                change.position.y,
                parentNode.style.height - NODE_HEIGHT - GROUP_PADDING
              )
            );
            updateNodePositions(node.id, newY);
            return {
              ...change,
              position: {
                x: node.position.x,
                y: newY
              }
            };
          }
        }
      }
      return change;
    });

    onNodesChange(modifiedChanges);
  }, [nodes, onNodesChange, updateNodePositions]);

  useEffect(() => {
    // Ensure the start node stays in the top-left corner
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'start'
          ? { ...node, position: { x: 50 / zoom - x, y: 50 / zoom - y } }
          : node
      )
    );
  }, [x, y, zoom, setNodes]);

  // Modify your node types to use the animated versions
  const nodeTypes = useMemo(() => ({
    textInput: AnimatedCustomTextInputNode,
    quickReply: motion.create(CustomQuickReplyNode),
    condition: motion.create(CustomConditionNode),
    delay: motion.create(CustomDelayNode),
    group: GroupNode,
    start: StartNode, // Add the new StartNode type
  }), []);

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
          onNodesChange={customOnNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
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