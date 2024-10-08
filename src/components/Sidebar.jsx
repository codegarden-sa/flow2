import React from 'react';
import { Button } from 'antd';

const Sidebar = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
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
  );
};

export default Sidebar;