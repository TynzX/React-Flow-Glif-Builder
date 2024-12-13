import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  MarkerType,
  useEdgesState,
  useNodesState,
  addEdge,
} from 'reactflow';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomNode } from './CustomNode';
import { useFlowStore } from '../store/flowStore';

// Define custom edge styles
const edgeOptions = {
  animated: true,
  style: {
    stroke: '#374151',
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#374151',
  },
};

const defaultEdgeOptions = {
  ...edgeOptions,
  type: 'smoothstep',  // You can also use 'default', 'straight', or 'step'
};

const nodeTypes = {
  custom: CustomNode,
};

export function FlowCanvas() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    deleteSelectedNodes 
  } = useFlowStore();

  const onKeyDown = useCallback((event) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && document.activeElement === event.target) {
      deleteSelectedNodes();
    }
  }, [deleteSelectedNodes]);

  return (
    <div 
      className="w-full h-full" 
      tabIndex={-1} 
      onKeyDown={onKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <Button 
            variant="secondary" 
            onClick={deleteSelectedNodes}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove Selected
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}