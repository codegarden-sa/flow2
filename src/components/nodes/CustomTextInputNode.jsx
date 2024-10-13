import React, { forwardRef } from 'react';
import { NodeToolbar } from 'reactflow';
import { Input } from 'antd';
import { MessageSquare, Copy, Trash2 } from 'lucide-react';
import { NODE_WIDTH } from '../../constants/flowConstants';

const CustomTextInputNode = forwardRef(({ data, id }, ref) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
        style={{ left: 0, top: '-40px' }}
      >
        <Copy
          size={18}
          onClick={() => console.log('Copy node', id)}
          style={{ cursor: 'pointer', marginRight: '8px' }}
        />
        <Trash2 size={18} onClick={() => data.onDelete(id)} style={{ cursor: 'pointer' }} />
      </NodeToolbar>
      <div
        style={{
          padding: 15,
          borderRadius: 10,
          backgroundColor: '#f0f5ff',
          width: NODE_WIDTH,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #d6e4ff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <MessageSquare size={24} color='#7cb305' style={{ marginRight: 10 }} />
          <strong style={{ color: '#262626' }}>{data.label}</strong>
        </div>
        <Input
          placeholder='Type your answer'
          style={{
            marginTop: 5,
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #b7eb8f',
            backgroundColor: '#f6ffed',
          }}
        />
      </div>
    </>
  );
});

export default CustomTextInputNode;
