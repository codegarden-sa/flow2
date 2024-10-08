import React, { forwardRef } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { Input, Button } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { NODE_WIDTH } from '../../constants/flowConstants';

const CustomQuickReplyNode = forwardRef(({ data, id }, ref) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
        style={{ left: 0, top: '1.5%' }}
      >
        <CopyOutlined onClick={() => console.log('Copy node', id)} />
        <DeleteOutlined onClick={() => data.onDelete(id)} />
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#ffe6cc', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div>
          {data.options.map((option, index) => (
            <Input
              key={index}
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => data.onOptionChange(index, e.target.value)}
              style={{ marginTop: 5, width: '100%', padding: '5px' }}
            />
          ))}
          <Button
            icon={<PlusOutlined />}
            onClick={data.onAddOption}
            style={{ marginTop: 5 }}
          >
            Add Option
          </Button>
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </>
  );
});

export default CustomQuickReplyNode;