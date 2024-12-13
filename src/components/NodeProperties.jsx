import React, { useState } from 'react';

export function NodeProperties({ nodeType, properties, onChange, output, nodeName, onNameChange }) {
  console.log('NodeProperties render:', {
    nodeType,
    properties,
    output,
    nodeName
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleNameChange = (newName) => {
    try {
      onNameChange(newName);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (name, value) => {
    onChange({ ...properties, [name]: value });
  };

  const renderProperty = (prop) => {
    switch (prop.type) {
      case 'text':
        return (
          <textarea
            className="w-full p-2 border rounded"
            value={properties[prop.name] || ''}
            onChange={(e) => handleChange(prop.name, e.target.value)}
            placeholder={prop.required ? '(Required)' : '(Optional)'}
          />
        );
      case 'select':
        return (
          <select
            className="w-full p-2 border rounded"
            value={properties[prop.name] || prop.default}
            onChange={(e) => handleChange(prop.name, e.target.value)}
          >
            {prop.options?.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              className="flex-1"
              min={prop.min}
              max={prop.max}
              step={prop.step}
              value={properties[prop.name] || prop.default}
              onChange={(e) => handleChange(prop.name, parseFloat(e.target.value))}
            />
            <span className="text-sm text-gray-600">
              {properties[prop.name] || prop.default}
            </span>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            className="w-full p-2 border rounded"
            min={prop.min}
            max={prop.max}
            value={properties[prop.name] || prop.default}
            onChange={(e) => handleChange(prop.name, parseInt(e.target.value, 10))}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={properties[prop.name] || prop.default}
            onChange={(e) => handleChange(prop.name, e.target.checked)}
          />
        );
      default:
        return null;
    }
  };

  const renderOutput = () => {
    const outputValue = output || properties.output;
    
    if (!outputValue) return null;
    
    switch (nodeType.id) {
      case 'text-generation':
        return (
          <div className="p-4 border-t border-gray-200">
            <h4 className="font-medium text-sm mb-2">Output:</h4>
            <textarea
              key={JSON.stringify(outputValue)}
              className="w-full h-32 p-2 border rounded bg-gray-50 font-mono text-sm"
              value={typeof outputValue === 'object' ? JSON.stringify(outputValue, null, 2) : outputValue}
              readOnly
            />
          </div>
        );
      
      case 'image-generation':
        return (
          <div className="space-y-2">
            {outputValue?.url && (
              <img 
                key={outputValue.url}
                src={outputValue.url} 
                alt="Generated" 
                className="w-full rounded"
              />
            )}
          </div>
        );
      
      case 'audio-generation':
        return (
          <div className="space-y-2">
            <textarea
              key={JSON.stringify(outputValue)}
              className="w-full h-20 p-2 border rounded bg-gray-50 font-mono text-sm"
              value={typeof outputValue === 'object' ? JSON.stringify(outputValue, null, 2) : outputValue}
              readOnly
            />
            {outputValue?.url && (
              <audio
                key={outputValue.url}
                controls
                className="w-full"
                src={outputValue.url}
              />
            )}
          </div>
        );
      
      case 'video-composition':
        return (
          <div className="space-y-2">
            {outputValue?.url && (
              <video
                key={outputValue.url}
                controls
                className="w-full rounded"
                src={outputValue.url}
              />
            )}
            {outputValue?.error && (
              <div className="text-red-500 text-sm">{outputValue.error}</div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Node Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Node Name
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={nodeName || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter unique node name"
        />
      </div>

      {nodeType.properties.filter(prop => prop.name === 'model' || prop.name === 'prompt'|| prop.name === 'imageSource'|| prop.name === 'audioSource').map(prop => (
        <div key={prop.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {prop.name}
            {prop.required && <span className="text-red-500">*</span>}
          </label>
          {renderProperty(prop)}
        </div>
      ))}

      <button
        className="text-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide Options' : 'Advance Options'}
      </button>

      {isOpen && (
        <div className="mt-2">
          {nodeType.properties.filter(prop => prop.name !== 'model' && prop.name !== 'prompt'&& prop.name !== 'imageSource'&& prop.name !== 'audioSource').map(prop => (
            <div key={prop.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {prop.name}
                {prop.required && <span className="text-red-500">*</span>}
              </label>
              {renderProperty(prop)}
            </div>
          ))}
        </div>
      )}

      {/* Output Area */}
      <div className="mt-4">
        <div className="font-medium text-sm text-gray-700 mb-2">Output:</div>
        {renderOutput()}
      </div>
    </div>
  );
}