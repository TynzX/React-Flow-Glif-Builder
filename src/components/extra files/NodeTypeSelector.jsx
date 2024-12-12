// import React from 'react';
// import { nodeTypes } from '../config/nodeTypes';

// export function NodeTypeSelector({ isOpen, onClose, onSelect }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
//       <div className="bg-white rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
//         <h2 className="text-xl font-semibold mb-4">Add Node</h2>
//         <div className="grid gap-4">
//           {nodeTypes.map((type) => (
//             <button
//               key={type.id}
//               onClick={() => onSelect(type.id)}
//               className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
//             >
//               <div className="mr-4 text-2xl">{type.icon}</div>
//               <div>
//                 <h3 className="font-medium text-gray-900">{type.name}</h3>
//                 <p className="text-sm text-gray-500 mt-1">{type.description}</p>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }