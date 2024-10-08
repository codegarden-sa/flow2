import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { NODE_HEIGHT, GROUP_PADDING, LABEL_HEIGHT, GROUP_WIDTH, INITIAL_GROUP_HEIGHT } from '../constants/flowConstants';

const initialNodes = [
  {
    id: 'start',
    type: 'start',
    position: { x: 50, y: 50 },
    data: { label: 'Start' },
  },
];

const initialEdges = [];

const useCustomNodes = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [groupCounter, setGroupCounter] = useState(0);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const updateGroupDimensions = useCallback((groupId) => {
    setNodes((nds) => {
      const groupNode = nds.find((n) => n.id === groupId);
      if (!groupNode) return nds;

      const childNodes = nds.filter((n) => n.parentNode === groupId);
      if (childNodes.length === 0) return nds;

      const minX = Math.min(...childNodes.map((n) => n.position.x));
      const minY = Math.min(...childNodes.map((n) => n.position.y));
      const maxX = Math.max(...childNodes.map((n) => n.position.x + GROUP_WIDTH));
      const maxY = Math.max(...childNodes.map((n) => n.position.y + NODE_HEIGHT));

      const newWidth = maxX - minX + 2 * GROUP_PADDING;
      const newHeight = maxY - minY + 2 * GROUP_PADDING + LABEL_HEIGHT;

      return nds.map((node) => {
        if (node.id === groupId) {
          node.style = {
            ...node.style,
            width: newWidth,
            height: newHeight,
          };
        }
        return node;
      });
    });
  }, [setNodes]);

  const onNodesDelete = useCallback((deletedNodes) => {
    const groupsToUpdate = new Set();
    deletedNodes.forEach((node) => {
      if (node.parentNode) {
        groupsToUpdate.add(node.parentNode);
      }
    });
    groupsToUpdate.forEach((groupId) => {
      updateGroupDimensions(groupId);
    });
  }, [updateGroupDimensions]);

  const addGroupNode = useCallback(() => {
    const newGroupId = `group-${groupCounter + 1}`;
    const newGroup = {
      id: newGroupId,
      type: 'group',
      position: { x: 100, y: 100 },
      style: {
        width: GROUP_WIDTH,
        height: INITIAL_GROUP_HEIGHT,
      },
      data: { label: `Group ${groupCounter + 1}` },
    };
    setNodes((nds) => [...nds, newGroup]);
    setGroupCounter((prevCounter) => prevCounter + 1);
    return newGroupId;
  }, [groupCounter, setNodes]);

  const addNodeToGroup = useCallback((nodeType, groupId) => {
    const newNode = {
      id: `${nodeType}-${nodes.length + 1}`,
      type: nodeType,
      position: { x: GROUP_PADDING, y: GROUP_PADDING + LABEL_HEIGHT },
      data: { label: `${nodeType} ${nodes.length + 1}` },
      parentNode: groupId,
      extent: 'parent',
    };
    setNodes((nds) => [...nds, newNode]);
    updateGroupDimensions(groupId);
  }, [nodes, setNodes, updateGroupDimensions]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDeleteNode,
    updateGroupDimensions,
    onNodesDelete,
    addGroupNode,
    addNodeToGroup,
  };
};

export default useCustomNodes;