import React, { forwardRef } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { InputNumber, Select } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { NODE_WIDTH } from '../../constants/flowConstants';

const { Option } = Select;

const CustomDelayNode = forwardRef(({ data, id }, ref) => {
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#ccf2ff', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div style={{ display: 'flex', marginTop: 5 }}>
          <InputNumber
            style={{ width: '60%', marginRight: 5 }}
            min={1}
            max={1000}
            value={data.delay}
            onChange={data.onDelayChange}
          />
          <Select
            style={{ width: '40%' }}
            value={data.unit}
            onChange={data.onUnitChange}
          >
            <Option value="seconds">Seconds</Option>
            <Option value="minutes">Minutes</Option>
            <Option value="hours">Hours</Option>
          </Select>
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </>
  );
});

export default CustomDelayNode;