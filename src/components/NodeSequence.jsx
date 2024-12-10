import React from 'react';
import { useFlowStore } from '../store/flowStore';
import { nodeTypes } from '../config/nodeTypes';
import { ArrowDown } from 'lucide-react';

export function NodeSequence() {
  const nodes = useFlowStore((state) => state.nodes);

  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="text-sm font-semibold text-gray-500 mb-4">Flow Sequence</h2>
      <div className="space-y-2">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className="flex items-center p-2 rounded bg-gray-50 border border-gray-200">
              <span className="text-xl mr-2">{nodeTypes.find((t) => t.id === node.data.type)?.icon}</span>
              <div className="text-sm">
                <div className="font-medium">
                  {nodeTypes.find((t) => t.id === node.data.type)?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {node.data.name || 'Unnamed Node'}
                </div>
              </div>
            </div>
            {index < nodes.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center bg-white">
                  <ArrowDown className="w-4 h-4 text-green-300" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
        {nodes.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            No nodes added yet
          </div>
        )}
      </div>
    </div>
  );
}