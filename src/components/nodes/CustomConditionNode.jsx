import React, { forwardRef } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { Select, Input } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { NODE_WIDTH } from '../../constants/flowConstants';

const { Option } = Select;

const CustomConditionNode = forwardRef(({ data, id }, ref) => {
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#e6ccff', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div style={{ display: 'flex', marginTop: 5 }}>
          <Select
            style={{ width: '40%', marginRight: 5 }}
            value={data.condition}
            onChange={data.onConditionChange}
          >
            <Option value="equals">Equals</Option>
            <Option value="contains">Contains</Option>
            <Option value="startsWith">Starts with</Option>
            <Option value="endsWith">Ends with</Option>
          </Select>
          <Input
            style={{ width: '60%' }}
            placeholder="Value"
            value={data.value}
            onChange={data.onValueChange}
          />
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" id="true" />
      <Handle type="source" position="bottom" id="false" />
    </>
  );
});

export default CustomConditionNode;