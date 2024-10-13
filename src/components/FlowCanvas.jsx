import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  useViewport,
} from 'reactflow';
import { Button } from 'antd';
import CustomEdge from './edges/CustomEdge';
import GroupNode from './nodes/GroupNode';
import StartNode from './nodes/StartNode';
import AnimatedCustomTextInputNode from './nodes/CustomTextInputNode';
import AnimatedCustomQuickReplyNode from './nodes/CustomQuickReplyNode';
import AnimatedCustomConditionNode from './nodes/CustomConditionNode';
import AnimatedCustomDelayNode from './nodes/CustomDelayNode';
import useCustomNodes from '../hooks/useCustomNodes';

import {
  NODE_WIDTH,
  NODE_HEIGHT,
  GROUP_PADDING,
  LABEL_HEIGHT,
  GROUP_WIDTH,
  INITIAL_GROUP_HEIGHT,
  VERTICAL_NODE_SPACING,
  CHILD_MARGIN,
} from '../constants/flowConstants';

const initialNodes = [
  {
    id: 'start',
    type: 'start',
    position: { x: 50, y: 50 },
    data: { label: 'Start' },
  },
];

const initialEdges = [];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [groupCounter, setGroupCounter] = useState(0);
  const reactFlowInstance = useReactFlow();
  const { x, y, zoom } = useViewport();

  const {
    updateGroupDimensions,
    getNextChildPosition,
    onDeleteNode,
    onDrop,
    onDragOver,
    updateNodePositions,
    getExecutionOrder,
    executeNodesInOrder,
  } = useCustomNodes(nodes, setNodes, setEdges, groupCounter, setGroupCounter);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'default' }, eds)),
    [setEdges]
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

  const customOnNodesChange = useCallback(
    (changes) => {
      const modifiedChanges = changes.map((change) => {
        if (change.type === 'position' && change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && node.parentId) {
            const parentNode = nodes.find((n) => n.id === node.parentId);
            if (parentNode) {
              const newY = Math.max(
                LABEL_HEIGHT + GROUP_PADDING,
                Math.min(change.position.y, parentNode.style.height - NODE_HEIGHT - GROUP_PADDING)
              );
              updateNodePositions(node.id, newY);
              return {
                ...change,
                position: {
                  x: node.position.x,
                  y: newY,
                },
              };
            }
          }
        }
        return change;
      });

      onNodesChange(modifiedChanges);
    },
    [nodes, onNodesChange, updateNodePositions]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'start' ? { ...node, position: { x: 50 / zoom - x, y: 50 / zoom - y } } : node
      )
    );
  }, [x, y, zoom, setNodes]);

  const nodeTypes = useMemo(
    () => ({
      textInput: AnimatedCustomTextInputNode,
      quickReply: AnimatedCustomQuickReplyNode,
      condition: AnimatedCustomConditionNode,
      delay: AnimatedCustomDelayNode,
      group: GroupNode,
      start: StartNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      default: CustomEdge,
    }),
    []
  );

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
          edgeTypes={edgeTypes}
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

export default FlowCanvas;
