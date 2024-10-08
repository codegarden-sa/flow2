import React, { forwardRef } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { motion } from 'framer-motion';
import { NODE_WIDTH } from '../../constants/flowConstants';

const CustomTextInputNode = forwardRef(({ data, id }, ref) => {
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
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#e6ffcc', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div>
          <Input
            placeholder="Type your answer"
            style={{ marginTop: 5, width: '100%', padding: '5px' }}
          />
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </>
  );
});

const AnimatedCustomTextInputNode = motion(CustomTextInputNode);

export default AnimatedCustomTextInputNode;