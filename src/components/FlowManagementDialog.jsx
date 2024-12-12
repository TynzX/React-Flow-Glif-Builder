import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

export function FlowManagementDialog({ isOpen, onClose, onImport, mode }) {
  const [flowName, setFlowName] = useState('');
  const [savedFlows, setSavedFlows] = useState([]);

  useEffect(() => {
    // Load saved flows from localStorage
    const flows = Object.keys(localStorage)
      .filter(key => key.startsWith('flow_'))
      .map(key => ({
        name: key.replace('flow_', ''),
        data: JSON.parse(localStorage.getItem(key))
      }));
    setSavedFlows(flows);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      return;
    }
    onClose(flowName);
    setFlowName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'save' ? 'Save Flow' : 'Import Flow'}
          </h2>
          <button onClick={() => onClose(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'save' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Enter flow name"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Flow
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedFlows.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No saved flows found</p>
            ) : (
              savedFlows.map((flow) => (
                <button
                  key={flow.name}
                  onClick={() => onImport(flow)}
                  className="w-full p-4 text-left border rounded hover:bg-gray-50"
                >
                  <h3 className="font-medium">{flow.name}</h3>
                  <p className="text-sm text-gray-500">
                    {flow.data.nodes.length} nodes
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 