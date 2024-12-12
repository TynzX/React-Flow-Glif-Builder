// import React from 'react';
// import { Play } from 'lucide-react';
// import { Button } from './ui/Button';
// import { useStore } from '../store/flowStore';

// export function RunButton() {
//   const nodes = useStore((state) => state.nodes);
  
//   const handleRun = () => {
//     console.log('Running flow with nodes:', nodes);
//   };

//   return (
//     <div className="flex items-center gap-4">
//       <h1 className="text-xl font-semibold">GLIF Builder</h1>
//       <Button onClick={handleRun} className="bg-black hover:bg-gray-800">
//         <Play className="w-4 h-4 mr-2" />
//         Run Flow
//       </Button>
//     </div>
//   );
// }