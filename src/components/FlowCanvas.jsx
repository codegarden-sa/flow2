import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useViewport,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomEdge from './edges/CustomEdge';
import CustomTextInputNode from './nodes/CustomTextInputNode';
import CustomQuickReplyNode from './nodes/CustomQuickReplyNode';
import CustomConditionNode from './nodes/CustomConditionNode';
import CustomDelayNode from './nodes/CustomDelayNode';
import GroupNode from './nodes/GroupNode';
import StartNode from './nodes/StartNode';
import { NODE_WIDTH, NODE_HEIGHT, GROUP_PADDING, LABEL_HEIGHT, GROUP_WIDTH, INITIAL_GROUP_HEIGHT, EXPANDED_GROUP_WIDTH, EXPANDED_GROUP_HEIGHT } from '../constants/flowConstants';

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'start',
      type: 'start',
      position: { x: 50, y: 50 },
      data: { label: 'Start' },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [groupCounter, setGroupCounter] = React.useState(0);
  const reactFlowInstance = useReactFlow();
  const { x, y, zoom } = useViewport();

  const updateGroupDimensions = useCallback((groupId) => {
    setNodes(nds => {
      const group = nds.find(n => n.id === groupId);
      if (!group) return nds;

      const childNodes = nds.filter(n => n.parentId === groupId);
      if (childNodes.length === 0) return nds;

      const maxY = Math.max(...childNodes.map(n => n.position.y + NODE_HEIGHT));
      const newHeight = maxY + GROUP_PADDING;

      return nds.map(n => n.id === groupId ? {
        ...n,
        style: { ...n.style, height: newHeight },
        data: { ...n.data, height: newHeight }
      } : n);
    });
  }, [setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'default' }, eds)),
    [setEdges]
  );

  const onDeleteNode = useCallback((id) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find(n => n.id === id);
      if (nodeToDelete && nodeToDelete.type === 'group') {
        return nds.filter(n => n.id !== id && n.parentId !== id);
      } else if (nodeToDelete && nodeToDelete.parentId) {
        const updatedNodes = nds.filter(n => n.id !== id);
        const remainingChildren = updatedNodes.filter(n => n.parentId === nodeToDelete.parentId);
        
        if (remainingChildren.length === 0) {
          return updatedNodes.filter(n => n.id !== nodeToDelete.parentId);
        } else {
          setTimeout(() => updateGroupDimensions(nodeToDelete.parentId), 0);
          return updatedNodes;
        }
      }
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

      const droppedOnGroup = nodes.find(node => 
        node.type === 'group' &&
        position.x >= node.position.x &&
        position.x <= node.position.x + GROUP_WIDTH &&
        position.y >= node.position.y &&
        position.y <= node.position.y + node.style.height
      );

      const newNodeId = `${type}-${nodes.length + 1}`;

      if (droppedOnGroup) {
        const newNode = {
          id: newNodeId,
          type,
          position: { x: GROUP_PADDING, y: LABEL_HEIGHT + GROUP_PADDING },
          data: { label, onDelete: onDeleteNode },
          parentId: droppedOnGroup.id,
          extent: 'parent',
          style: { width: NODE_WIDTH }
        };

        setNodes(nds => nds.map(n => {
          if (n.id === droppedOnGroup.id) {
            return {
              ...n,
              data: {
                ...n.data,
                isExpanded: false,
                children: [...(n.data.children || []), newNode]
              },
            };
          }
          return n;
        }));

        setTimeout(() => updateGroupDimensions(droppedOnGroup.id), 0);
      } else {
        const newGroupId = `group-${groupCounter + 1}`;
        setGroupCounter(prev => prev + 1);
        
        const newGroup = {
          id: newGroupId,
          type: 'group',
          position: position,
          style: { width: GROUP_WIDTH, height: INITIAL_GROUP_HEIGHT, backgroundColor: '#E6E6FA' },
          data: { 
            label: `Group ${groupCounter + 1}`, 
            height: INITIAL_GROUP_HEIGHT,
            onDelete: onDeleteNode,
            toolbarVisible: false,
            toolbarPosition: 'top',
            children: []
          },
        };

        const newNode = {
          id: newNodeId,
          type,
          position: { x: GROUP_PADDING, y: LABEL_HEIGHT + GROUP_PADDING },
          data: { label, onDelete: onDeleteNode },
          parentId: newGroupId,
          extent: 'parent',
          style: { width: NODE_WIDTH }
        };

        newGroup.data.children = [newNode];

        setNodes(nds => [...nds, newGroup]);
      }
    },
    [reactFlowInstance, nodes, setNodes, onDeleteNode, groupCounter, updateGroupDimensions]
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

  const nodeTypes = useMemo(() => ({
    textInput: CustomTextInputNode,
    quickReply: CustomQuickReplyNode,
    condition: CustomConditionNode,
    delay: CustomDelayNode,
    group: GroupNode,
    start: StartNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
  }), []);

  const nodeColor = (node) => {
    switch (node.type) {
      case 'textInput':
        return '#e6ffcc';
      case 'quickReply':
        return '#ffe6cc';
      case 'condition':
        return '#e6ccff';
      case 'delay':
        return '#ccf2ff';
      case 'group':
        return '#ffffff';
      case 'start':
        return '#ccffcc';
      default:
        return '#ff0072';
    }
  };

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === 'start'
          ? { ...node, position: { x: 50 / zoom - x, y: 50 / zoom - y } }
          : node
      )
    );
  }, [x, y, zoom, setNodes]);

  return (
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
  );
}

export default FlowCanvas;