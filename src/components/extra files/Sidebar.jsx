// import React from 'react';
// import { useStore } from '../store/flowStore';
// import { NodeProperties } from './NodeProperties';
// import { nodeTypes } from '../config/nodeTypes';

// interface SidebarProps {
//   selectedNode: string | null;
// }

// export function Sidebar({ selectedNode }: SidebarProps) {
//   const nodes = useStore((state) => state.nodes);
//   const updateNodeProperties = useStore((state) => state.updateNodeProperties);

//   const selectedNodeData = nodes.find((node) => node.id === selectedNode);
//   const nodeType = selectedNodeData 
//     ? nodeTypes.find((t) => t.id === selectedNodeData.data.type)
//     : null;

//   if (!selectedNodeData || !nodeType) {
//     return (
//       <div className="w-[400px] bg-white border-r p-4">
//         <div className="text-center text-gray-500 mt-8">
//           Select a node to configure its properties
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-[400px] bg-white border-r overflow-y-auto">
//       <div className="p-4 border-b">
//         <div className="flex items-center gap-2">
//           <span className="text-xl">{nodeType.icon}</span>
//           <h2 className="text-lg font-medium">{nodeType.name}</h2>
//         </div>
//         <p className="text-sm text-gray-600 mt-1">{nodeType.description}</p>
//       </div>

//       <NodeProperties
//         nodeType={nodeType}
//         properties={selectedNodeData.data.properties}
//         onChange={(newProperties) => {
//           updateNodeProperties(selectedNodeData.id, newProperties);
//         }}
//       />
//     </div>
//   );
// }