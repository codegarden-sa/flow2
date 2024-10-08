import React from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { Button } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { LABEL_HEIGHT, GROUP_PADDING } from '../../constants/flowConstants';

const GroupNode = ({ data, id }) => {
  return (
    <motion.div>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition || 'top'}
      >
        <Button icon={<CopyOutlined />} onClick={() => console.log('Copy group', id)}>
          Copy
        </Button>
        <Button icon={<DeleteOutlined />} onClick={() => data.onDelete(id)}>
          Delete
        </Button>
      </NodeToolbar>
      <div 
        style={{ 
          height: `${LABEL_HEIGHT}px`, 
          borderRadius: '5px',
          padding: '5px 10px', 
          fontWeight: 'bold', 
          backgroundColor: 'pink',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {data.label}
      </div>
      <motion.div 
        style={{ 
          flex: 1, 
          padding: GROUP_PADDING,
          position: 'relative'
        }}
      >
        {/* Child nodes will be rendered automatically by React Flow */}
      </motion.div>
      <Handle
        type="target"
        position="left"
        style={{ top: '15px', left: '-16px', border: 'none' }}
        className="w-4 h-4 !bg-teal-00 rounded-sm"
      />
      <Handle
        type="source"
        position="right"
        style={{ top: '90%', right: '-16px', border: 'none' }}
        className="w-4 h-4 !bg-teal-00 rounded-sm"
      />
    </motion.div>
  );
};

export default GroupNode;