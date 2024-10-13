import React, { forwardRef, useEffect } from 'react';
import { NodeToolbar, Handle } from 'reactflow';
import { Button } from 'antd';
import { Copy, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { LABEL_HEIGHT, GROUP_PADDING, CHILD_MARGIN } from '../../constants/flowConstants';

const GroupNode = forwardRef(({ data, id }, ref) => {
  useEffect(() => {
    if (data.children && data.children.length > 0) {
      const totalChildrenHeight = data.children.reduce((acc, child) => {
        // Assuming each child has a height property. Adjust if necessary.
        return acc + (child.props.style.height || 0) + CHILD_MARGIN;
      }, 0);

      const newHeight = LABEL_HEIGHT + GROUP_PADDING * 2 + totalChildrenHeight;
      if (data.onResize) {
        data.onResize(id, newHeight);
      }
    }
  }, [data.children, id, data.onResize]);

  return (
    <motion.div ref={ref} style={{ minHeight: data.style?.height }}>
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition || 'top'}>
        <Button icon={<Copy size={16} />} onClick={() => console.log('Copy group', id)}>
          Copy
        </Button>
        <Button icon={<Trash2 size={16} />} onClick={() => data.onDelete(id)}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${CHILD_MARGIN}px` }}>
          {data.children}
        </div>
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
