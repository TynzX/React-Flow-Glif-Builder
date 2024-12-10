import React, { useState } from 'react';
import { Play, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { useFlowStore } from '../store/flowStore';
import axios from 'axios';

export function Header({ onAddNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const { nodes, edges, setNodeOutput, updateNodeProperties, getNodeOutput } = useFlowStore();
  
  const processNode = async (node) => {
    try {
      console.log('Processing node:', {
        id: node.id,
        type: node.data.type,
        name: node.data.name,
        properties: node.data.properties
      });

      // Get input nodes connected to this node
      const inputEdges = edges.filter(edge => edge.target === node.id);
      const inputNodes = inputEdges.map(edge => 
        nodes.find(n => n.id === edge.source)
      );

      // Process input nodes first and collect their outputs
      const inputResults = await Promise.all(
        inputNodes.map(async (inputNode) => {
          if (!getNodeOutput(inputNode.data.name)) {
            await processNode(inputNode);
          }
          return getNodeOutput(inputNode.data.name);
        })
      );

      // Get the actual prompt, replacing any references to other nodes
      let processedPrompt = node.data.properties.prompt;
      
      // Replace {nodeName.output} placeholders with actual values
      const placeholderRegex = /{([^}]+)\.output}/g;
      processedPrompt = processedPrompt.replace(placeholderRegex, (match, nodeName) => {
        const sourceNode = nodes.find(n => n.data.name === nodeName);
        if (!sourceNode) {
          console.warn(`Node "${nodeName}" not found`);
          return match;
        }
        
        const output = getNodeOutput(nodeName);
        console.log('Using output from node:', {
          nodeName,
          output
        });
        return output || match;
      });

      let response;
      // Handle different node types
      switch (node.data.type) {
        case 'text-generation':
          response = await axios.post('http://localhost:3000/chat-completion', {
            ...node.data.properties,
            prompt: processedPrompt,
            nodeId: node.id,
            nodeType: node.data.type
          });
          break;

        case 'image-generation':
          try {
            const promptText = processedPrompt.trim();
            let imagePrompts;

            if (promptText.startsWith('[')) {
              const cleanJson = promptText
                .replace(/\n/g, '') // Remove newlines
                .replace(/\r/g, '') // Remove carriage returns
                .replace(/\\n/g, '') // Remove escaped newlines
                .replace(/\s+/g, ' '); // Replace multiple spaces with single space
              
              console.log('Attempting to parse JSON:', cleanJson);
              
              try {
                imagePrompts = JSON.parse(cleanJson);
              } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.log('Invalid JSON string:', cleanJson);
                throw new Error('Failed to parse prompt JSON: ' + parseError.message);
              }
            } else {
              // Single prompt
              imagePrompts = [{ prompt: promptText }];
            }

            console.log('Sending to Leonardo API:', imagePrompts);
            
            response = await axios.post('http://localhost:3000/generate-images-leonardo', imagePrompts);
          } catch (error) {
            console.error('Error processing image prompts:', error);
            throw new Error(`Failed to process image prompts: ${error.message}`);
          }
          break;

        default:
          throw new Error(`Unsupported node type: ${node.data.type}`);
      }

      console.log('API Response:', response.data);

      // Update node properties and output atomically
      const result = response.data;
      
      // Update properties first
      updateNodeProperties(node.id, {
        ...node.data.properties,
        output: result
      });
      
      // Then set the output
      setNodeOutput(node.id, result);
      
      // Return the result for use by dependent nodes
      return result;

    } catch (error) {
      console.error(`Error processing node ${node.id}:`, error);
      setNodeOutput(node.id, { error: error.message });
      throw error;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      // Sort nodes based on dependencies
      const sortedNodes = [...nodes].sort((a, b) => {
        const aIsInput = edges.some(e => e.target === b.id && e.source === a.id);
        const bIsInput = edges.some(e => e.target === a.id && e.source === b.id);
        return aIsInput ? -1 : bIsInput ? 1 : 0;
      });

      // Process each node in order
      for (const node of sortedNodes) {
        await processNode(node);
      }
    } catch (error) {
      console.error('Error running flow:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-white border-b flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">GLIF Builder</h1>
        <Button 
          onClick={handleRun} 
          className="bg-black hover:bg-gray-800"
          disabled={isRunning}
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Flow'}
        </Button>
      </div>
      <Button onClick={onAddNode} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Node
      </Button>
    </div>
  );
}