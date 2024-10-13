import React, { forwardRef } from 'react';
import { NodeToolbar } from 'reactflow';
import { Button } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { NODE_WIDTH } from '../../constants/flowConstants';

const CustomQuickReplyNode = forwardRef(({ data, id }, ref) => {
  return (
    <>
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy node', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div style={{ padding: 10, borderRadius: 5, backgroundColor: '#f0f2f5', width: NODE_WIDTH }}>
        <strong>{data.label}</strong>
        <div>
          <Button style={{ marginRight: 5 }}>Yes</Button>
          <Button>No</Button>
        </div>
      </div>
    </>
  );
});

export default CustomQuickReplyNode;
