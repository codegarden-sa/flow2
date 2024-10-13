import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

const NODE_WIDTH = 230;
const NODE_HEIGHT = 80;
const GROUP_PADDING = 10;
const LABEL_HEIGHT = 30;
const GROUP_WIDTH = 250;
const INITIAL_GROUP_HEIGHT = 150;
const VERTICAL_NODE_SPACING = 20;

const useCustomNodes = (nodes, setNodes, setEdges, groupCounter, setGroupCounter) => {
  const reactFlowInstance = useReactFlow();

  const updateGroupDimensions = useCallback(
    (groupId) => {
      setNodes((nds) => {
        const group = nds.find((n) => n.id === groupId);
        if (!group) return nds;

        const childNodes = nds.filter((n) => n.parentId === groupId);
        if (childNodes.length === 0) return nds;

        const maxY = Math.max(...childNodes.map((n) => n.position.y + NODE_HEIGHT));
        const newHeight = maxY + GROUP_PADDING;

        return nds.map((n) =>
          n.id === groupId
            ? {
                ...n,
                style: { ...n.style, height: newHeight },
                data: { ...n.data, height: newHeight },
              }
            : n
        );
      });
    },
    [setNodes]
  );

  const getNextChildPosition = useCallback(
    (groupId) => {
      const childNodes = nodes.filter((n) => n.parentId === groupId);
      if (childNodes.length === 0) {
        return { x: GROUP_PADDING, y: LABEL_HEIGHT + GROUP_PADDING };
      }
      const maxY = Math.max(...childNodes.map((n) => n.position.y + NODE_HEIGHT));
      return { x: GROUP_PADDING, y: maxY + VERTICAL_NODE_SPACING };
    },
    [nodes]
  );

  const onDeleteNode = useCallback(
    (id) => {
      setNodes((nds) => {
        const nodeToDelete = nds.find((n) => n.id === id);
        if (nodeToDelete && nodeToDelete.type === 'group') {
          return nds.filter((n) => n.id !== id && n.parentId !== id);
        } else if (nodeToDelete && nodeToDelete.parentId) {
          const updatedNodes = nds.filter((n) => n.id !== id);
          const remainingChildren = updatedNodes.filter(
            (n) => n.parentId === nodeToDelete.parentId
          );

          if (remainingChildren.length === 0) {
            return updatedNodes.filter((n) => n.id !== nodeToDelete.parentId);
          } else {
            let currentY = LABEL_HEIGHT + GROUP_PADDING;
            const repositionedNodes = updatedNodes.map((n) => {
              if (n.parentId === nodeToDelete.parentId) {
                const newNode = { ...n, position: { x: GROUP_PADDING, y: currentY } };
                currentY += NODE_HEIGHT + VERTICAL_NODE_SPACING;
                return newNode;
              }
              return n;
            });

            setTimeout(() => updateGroupDimensions(nodeToDelete.parentId), 0);

            return repositionedNodes;
          }
        }
        return nds.filter((n) => n.id !== id);
      });
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges, updateGroupDimensions]
  );

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

      const droppedOnGroup = nodes.find(
        (node) =>
          node.type === 'group' &&
          position.x >= node.position.x &&
          position.x <= node.position.x + GROUP_WIDTH &&
          position.y >= node.position.y &&
          position.y <= node.position.y + node.style.height
      );

      const newNodeId = `${type}-${nodes.length + 1}`;

      if (droppedOnGroup) {
        const newNodePosition = getNextChildPosition(droppedOnGroup.id);
        const newNode = {
          id: newNodeId,
          type,
          position: newNodePosition,
          data: { label, onDelete: onDeleteNode },
          parentId: droppedOnGroup.id,
          extent: 'parent',
          style: { width: NODE_WIDTH },
        };

        setNodes((nds) =>
          nds
            .map((n) => {
              if (n.id === droppedOnGroup.id) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    isExpanded: false,
                  },
                };
              }
              return n;
            })
            .concat(newNode)
        );

        setTimeout(() => updateGroupDimensions(droppedOnGroup.id), 0);
      } else {
        const newGroupId = `group-${groupCounter + 1}`;
        setGroupCounter((prev) => prev + 1);

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
          },
        };

        const newNode = {
          id: newNodeId,
          type,
          position: {
            x: GROUP_PADDING,
            y: GROUP_PADDING + INITIAL_GROUP_HEIGHT * (LABEL_HEIGHT / 100),
          },
          data: { label, onDelete: onDeleteNode },
          parentId: newGroupId,
          extent: 'parent',
          style: { width: NODE_WIDTH },
        };

        setNodes((nds) => [...nds, newGroup, newNode]);
      }
    },
    [
      reactFlowInstance,
      nodes,
      setNodes,
      onDeleteNode,
      groupCounter,
      updateGroupDimensions,
      getNextChildPosition,
      setGroupCounter,
    ]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const groupNode = nodes.find(
        (n) =>
          n.type === 'group' &&
          event.clientX > n.position.x &&
          event.clientX < n.position.x + GROUP_WIDTH &&
          event.clientY > n.position.y &&
          event.clientY < n.position.y + n.style.height
      );

      setNodes((nds) =>
        nds.map((n) =>
          n.type === 'group' ? { ...n, data: { ...n.data, isExpanded: n.id === groupNode?.id } } : n
        )
      );
    },
    [nodes, setNodes]
  );

  const updateNodePositions = useCallback(
    (movedNodeId, newY) => {
      setNodes((currentNodes) => {
        const movedNode = currentNodes.find((n) => n.id === movedNodeId);
        if (!movedNode || !movedNode.parentId) return currentNodes;

        const parentNode = currentNodes.find((n) => n.id === movedNode.parentId);
        const siblingNodes = currentNodes.filter(
          (n) => n.parentId === movedNode.parentId && n.id !== movedNodeId
        );

        siblingNodes.sort((a, b) => a.position.y - b.position.y);

        let updatedNodes = [...currentNodes];
        let currentY = LABEL_HEIGHT + GROUP_PADDING;

        siblingNodes.forEach((node) => {
          if (node.id === movedNodeId) {
            node.position.y = newY;
          }

          if (node.position.y < currentY) {
            node.position.y = currentY;
          }

          currentY = node.position.y + NODE_HEIGHT + VERTICAL_NODE_SPACING;
        });

        const maxY = Math.max(...siblingNodes.map((n) => n.position.y + NODE_HEIGHT));
        const newParentHeight = Math.max(INITIAL_GROUP_HEIGHT, maxY + GROUP_PADDING);

        updatedNodes = updatedNodes.map((n) =>
          n.id === parentNode.id ? { ...n, style: { ...n.style, height: newParentHeight } } : n
        );

        return updatedNodes;
      });
    },
    [setNodes]
  );

  const getExecutionOrder = useCallback(
    (groupId) => {
      const groupNodes = nodes.filter((n) => n.parentId === groupId);
      return groupNodes.sort((a, b) => a.position.y - b.position.y).map((n) => n.id);
    },
    [nodes]
  );

  const executeNodesInOrder = useCallback(
    (groupId) => {
      const executionOrder = getExecutionOrder(groupId);
      console.log(`Execution order for group ${groupId}:`, executionOrder);
    },
    [getExecutionOrder]
  );

  return {
    updateGroupDimensions,
    getNextChildPosition,
    onDeleteNode,
    onDrop,
    onDragOver,
    updateNodePositions,
    getExecutionOrder,
    executeNodesInOrder,
  };
};

export default useCustomNodes;
