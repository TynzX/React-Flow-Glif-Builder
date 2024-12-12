// import React from 'react';
// import { Plus, Trash2 } from 'lucide-react';
// import { Button } from './ui/Button';
// import { useStore } from '../store/flowStore';

// interface ToolbarProps {
//   onAddNode: () => void;
// }

// export function Toolbar({ onAddNode }: ToolbarProps) {
//   const deleteSelectedNodes = useStore((state) => state.deleteSelectedNodes);

//   return (
//     <div className="absolute top-4 left-4 z-10 flex gap-2">
//       <Button onClick={onAddNode}>
//         <Plus className="w-4 h-4 mr-2" />
//         Add Node
//       </Button>
//       <Button variant="secondary" onClick={deleteSelectedNodes}>
//         <Trash2 className="w-4 h-4 mr-2" />
//         Remove Node
//       </Button>
//     </div>
//   );
// }