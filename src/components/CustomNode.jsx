import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useNodes, useEdges } from 'reactflow';
import { nodeTypes } from '../config/nodeTypes';
import { NodeProperties } from './NodeProperties';
import { Button } from './ui/Button';
import axios from 'axios';
import { useFlowStore } from '../store/flowStore';

export const CustomNode = memo(function CustomNode({ data, selected }) {
  const nodeType = nodeTypes.find((t) => t.id === data.type);
  const nodes = useNodes();
  const edges = useEdges();
  const [output, setOutput] = useState(null);
  const setNodeOutput = useFlowStore(state => state.setNodeOutput);
  const getNodeOutput = useFlowStore(state => state.getNodeOutput);
  const handleNodeRun = useFlowStore(state => state.handleNodeRun);

  const getInputFromConnectedNode = () => {
    const incomingEdges = edges.filter(edge => edge.target === data.id);
    console.log('Incoming edges:', incomingEdges);
    
    if (!incomingEdges.length) return null;

    const sourceNodeId = incomingEdges[0].source;
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    console.log('Source node:', sourceNode);
    
    if (!sourceNode?.data?.output) return null;
    console.log('Source node output:', sourceNode.data.output);
    return sourceNode.data.output;
  };

  const processPromptWithInput = (properties) => {
    const newProperties = { ...properties };
    
    // Find all placeholders like {nodeName.output}
    const placeholderRegex = /{([^}]+)\.output}/g;
    let matches;
    
    const processText = (text) => {
      if (!text) return text;
      
      let processedText = text;
      while ((matches = placeholderRegex.exec(text)) !== null) {
        const [fullMatch, nodeName] = matches;
        const nodeOutput = getNodeOutput(nodeName);
        
        if (nodeOutput) {
          const outputText = typeof nodeOutput === 'object' 
            ? (nodeOutput.text || nodeOutput.url || JSON.stringify(nodeOutput))
            : nodeOutput.toString();
            
          processedText = processedText.replace(fullMatch, outputText);
        }
      }
      return processedText;
    };

    if (newProperties.prompt) {
      newProperties.prompt = processText(newProperties.prompt);
    }
    if (newProperties.text) {
      newProperties.text = processText(newProperties.text);
    }

    return newProperties;
  };

  const handleTextGeneration = async () => {
    try {
      const processedProperties = processPromptWithInput(data.properties);
      const response = await axios.post('http://localhost:3000/chat-completion', {
        ...processedProperties,
        nodeId: data.id,
        nodeType: data.type
      });
      
      let result = response.data;
      if (typeof result === 'string') {
        try {
          result = JSON.parse(result);
        } catch (parseError) {
          result = { text: result };
        }
      }
      
      setOutput(result);
      setNodeOutput(data.id, result);
      data.onChange?.({ ...data.properties, output: result });
      return result;
    } catch (error) {
      const errorMessage = `Error: ${error.response?.data || error.message}`;
      setOutput(errorMessage);
      setNodeOutput(data.id, errorMessage);
      data.onChange?.({ ...data.properties, output: errorMessage });
      throw error;
    }
  };

  const handleImageGeneration = async () => {
    try {
      const processedProperties = processPromptWithInput(data.properties);
      const response = await axios.post('http://localhost:3000/image-generation', {
        ...processedProperties,
        nodeId: data.id,
        nodeType: data.type
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let result;
      if (typeof response.data === 'string') {
        try {
          result = JSON.parse(response.data);
        } catch (parseError) {
          result = { url: response.data };
        }
      } else {
        result = response.data;
      }
      
      setOutput(result);
      setNodeOutput(data.id, result);
      data.onChange?.({ ...data.properties, output: result });
      console.log('Image Generation Response:', result);
      return result;
    } catch (error) {
      const errorMessage = `Error: ${error.response?.data || error.message}`;
      setOutput(errorMessage);
      setNodeOutput(data.id, errorMessage);
      data.onChange?.({ ...data.properties, output: errorMessage });
      console.error('Image Generation Error:', error);
      throw error;
    }
  };

  const handleVideoGeneration = async () => {
    try {
      const processedProperties = processPromptWithInput(data.properties);
      const response = await axios.post('http://localhost:3000/video-generation', {
        ...processedProperties,
        nodeId: data.id,
        nodeType: data.type
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let result;
      if (typeof response.data === 'string') {
        try {
          result = JSON.parse(response.data);
        } catch (parseError) {
          result = { url: response.data };
        }
      } else {
        result = response.data;
      }
      
      setOutput(result);
      setNodeOutput(data.id, result);
      data.onChange?.({ ...data.properties, output: result });
      console.log('Video Generation Response:', result);
      return result;
    } catch (error) {
      const errorMessage = `Error: ${error.response?.data || error.message}`;
      setOutput(errorMessage);
      setNodeOutput(data.id, errorMessage);
      data.onChange?.({ ...data.properties, output: errorMessage });
      console.error('Video Generation Error:', error);
      throw error;
    }
  };

  const handleAudioGeneration = async () => {
    try {
      const processedProperties = processPromptWithInput(data.properties);
      // For audio generation, we need to process the 'text' property instead of 'prompt'
      if (processedProperties.text && typeof processedProperties.text === 'string') {
        processedProperties.text = processedProperties.text.replace('{input}', inputText);
      }
      
      const response = await axios.post('http://localhost:3000/audio-generation', {
        ...processedProperties,
        nodeId: data.id,
        nodeType: data.type
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let result;
      if (typeof response.data === 'string') {
        try {
          result = JSON.parse(response.data);
        } catch (parseError) {
          result = { url: response.data };
        }
      } else {
        result = response.data;
      }
      
      setOutput(result);
      setNodeOutput(data.id, result);
      data.onChange?.({ ...data.properties, output: result });
      console.log('Audio Generation Response:', result);
      return result;
    } catch (error) {
      const errorMessage = `Error: ${error.response?.data || error.message}`;
      setOutput(errorMessage);
      setNodeOutput(data.id, errorMessage);
      data.onChange?.({ ...data.properties, output: errorMessage });
      console.error('Audio Generation Error:', error);
      throw error;
    }
  };

  const handleRun = async () => {
    try {
      const handlers = {
        'text-generation': handleTextGeneration,
        'image-generation': handleImageGeneration,
        'video-generation': handleVideoGeneration,
        'audio-generation': handleAudioGeneration
      };

      const handler = handlers[data.type];
      if (!handler) {
        console.error('Unknown node type:', data.type);
        return;
      }

      const result = await handler();
      console.log(`${nodeType.name} Result:`, result);
    } catch (error) {
      console.error(`Error in ${nodeType.name}:`, error);
    }
  };

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.stopPropagation();
    }
  }, []);

  const onRunClick = useCallback(async () => {
    if (handleNodeRun) {
      await handleNodeRun(data.id);
    }
  }, [handleNodeRun, data.id]);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 min-w-[300px] ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{nodeType.icon}</span>
          <h3 className="font-medium">{nodeType.name}</h3>
        </div>
      </div>

      <NodeProperties
        nodeType={nodeType}
        properties={data.properties || {}}
        onChange={(newProperties) => {
          data.onChange?.(newProperties);
        }}
        output={output}
        nodeName={data.name}
        onNameChange={(newName) => {
          data.onChange?.({ ...data.properties, name: newName });
        }}
      />

      <Button onClick={onRunClick} className="m-4">
        Run
      </Button>

      {Array.from({ length: nodeType.inputs }).map((_, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={Position.Left}
          style={{ top: `${((i + 1) * 100) / (nodeType.inputs + 1)}%` }}
        />
      ))}

      {Array.from({ length: nodeType.outputs }).map((_, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={Position.Right}
          style={{ top: `${((i + 1) * 100) / (nodeType.outputs + 1)}%` }}
        />
      ))}
    </div>
  );
});