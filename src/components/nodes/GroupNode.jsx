import React, { forwardRef } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { Button } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const LABEL_HEIGHT = 30;
const GROUP_PADDING = 10;

const GroupNode = forwardRef(({ data, id }, ref) => {
  return (
    <motion.div ref={ref}>
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition || 'top'}>
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
          alignItems: 'center',
        }}
      >
        {data.label}
      </div>
      <motion.div
        style={{
          flex: 1,
          padding: GROUP_PADDING,
          position: 'relative',
        }}
      >
        <AnimatePresence>
          {data.isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                color: 'rgba(0,0,0,0.3)',
              }}
            >
              Drop here
            </motion.div>
          )}
        </AnimatePresence>
        {data.children}
      </motion.div>
      <Handle
        type='target'
        position='left'
        style={{ top: '15px', left: '-16px', border: 'none' }}
        className='w-4 h-4 !bg-teal-00 rounded-sm'
      />
      <Handle
        type='source'
        position='right'
        style={{ top: '90%', right: '-16px', border: 'none' }}
        className='w-4 h-4 !bg-teal-00 rounded-sm'
      />
    </motion.div>
  );
});

export default GroupNode;
