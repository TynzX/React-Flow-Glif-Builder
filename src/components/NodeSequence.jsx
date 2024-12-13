import React, { useEffect } from 'react';
import { useFlowStore } from '../store/flowStore';
import { nodeTypes } from '../config/nodeTypes';
import { ArrowDown, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export function NodeSequence() {
  const nodes = useFlowStore((state) => state.nodes);
  const updateNodeSequence = useFlowStore((state) => state.updateNodeSequence);
  const connectNodesInSequence = useFlowStore((state) => state.connectNodesInSequence);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(nodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateNodeSequence(items);
    connectNodesInSequence();
  };

  useEffect(() => {
    if (nodes.length >= 2) {
      connectNodesInSequence();
    }
  }, [nodes.length, connectNodesInSequence]);

  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="text-sm font-semibold text-gray-500 mb-4">Flow Sequence</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {nodes.map((node, index) => (
                <Draggable
                  key={node.id}
                  draggableId={node.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-2"
                    >
                      <div className={`flex items-center p-2 rounded ${
                        snapshot.isDragging ? 'bg-blue-50' : 'bg-gray-50'
                      } border border-gray-200`}>
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 cursor-grab hover:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xl mr-2">
                          {nodeTypes.find((t) => t.id === node.data.type)?.icon}
                        </span>
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
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {nodes.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4">
          No nodes added yet
        </div>
      )}
    </div>
  );
}