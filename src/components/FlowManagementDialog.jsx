import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import axios from 'axios';

export function FlowManagementDialog({ isOpen, onClose, onImport, mode }) {
  const [flowName, setFlowName] = useState('');
  const [savedFlows, setSavedFlows] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && mode === 'import') {
      loadFlows();
    }
  }, [isOpen, mode]);

  const handleClose = () => {
    setFlowName('');
    onClose(null);
  };

  const loadFlows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/flows');
      setFlows(response.data);
    } catch (error) {
      console.error('Error loading flows:', error);
      setError('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

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
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
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
            {loading && <div>Loading flows...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && flows.length === 0 && (
              <div>No saved flows found</div>
            )}
            {flows.map((flow) => (
              <div
                key={flow._id}
                className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => onImport(flow)}
              >
                <div className="font-medium">{flow.name}</div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(flow.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 