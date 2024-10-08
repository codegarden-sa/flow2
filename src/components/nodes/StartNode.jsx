import React, { forwardRef } from 'react';
import {  Card } from 'antd';
import { Handle } from 'reactflow';
import { NODE_HEIGHT  } from '../../constants/flowConstants';

const StartNode = forwardRef(({ data }, ref) => {
    return (
        <Card
          style={{
            width: 120,
            height: NODE_HEIGHT,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#6ede87',
            border: '2px solid #4caf50',
          }}
        >
          <strong>{data.label}</strong>
          <Handle
            type="source"
            position="right"
            id="start-handle"
            style={{ bottom: '-5px', right: '-16px', border: 'none' }}
               className="w-4 h-4 !bg-teal-00 rounded-sm"
          />
        </Card>
      );
});

export default StartNode;