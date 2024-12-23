import React, { useState } from 'react';
import { Play, Plus, Save, Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { useFlowStore } from '../store/flowStore';
import { FlowManagementDialog } from './FlowManagementDialog';
import axios from 'axios';
import { Spinner } from './ui/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Header({ onAddNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('save');
  
  const { 
    nodes, 
    edges, 
    setNodeOutput, 
    updateNodeProperties, 
    getNodeOutput,
    setNodes,
    setEdges 
  } = useFlowStore();

  const processNode = async (node) => {
    try {
      console.log('Processing node:', {
        id: node.id,
        type: node.data.type,
        name: node.data.name,
        properties: node.data.properties
      });

      const inputEdges = edges.filter(edge => edge.target === node.id);
      const inputNodes = inputEdges.map(edge => 
        nodes.find(n => n.id === edge.source)
      );
      const inputResults = await Promise.all(
        inputNodes.map(async (inputNode) => {
          if (!getNodeOutput(inputNode.data.name)) {
            await processNode(inputNode);
          }
          return getNodeOutput(inputNode.data.name);
        })
      );

      let response;
      switch (node.data.type) {
        case 'video-composition':
          // Process imageSource placeholder
          let processedImageSource = node.data.properties.imageSource;
          if (processedImageSource) {
            const placeholderRegex = /{([^}]+)\.output}/g;
            processedImageSource = processedImageSource.replace(placeholderRegex, (match, nodeName) => {
              const sourceNode = nodes.find(n => n.data.name === nodeName);
              if (!sourceNode) {
                console.warn(`Node "${nodeName}" not found`);
                return match;
              }
              const output = getNodeOutput(nodeName);
              return JSON.stringify(output) || match;
            });
          }

          // Process audioSource placeholder
          let processedAudioSource = node.data.properties.audioSource;
          if (processedAudioSource) {
            const placeholderRegex = /{([^}]+)\.output}/g;
            processedAudioSource = processedAudioSource.replace(placeholderRegex, (match, nodeName) => {
              const sourceNode = nodes.find(n => n.data.name === nodeName);
              if (!sourceNode) {
                console.warn(`Node "${nodeName}" not found`);
                return match;
              }
              const output = getNodeOutput(nodeName);
              return JSON.stringify(output) || match;
            });
          }

          const imageOutput = processedImageSource 
            ? JSON.parse(processedImageSource)
            : getNodeOutput(inputNodes.find(n => n.data.type === 'image-generation')?.data.name);

          const audioOutput = processedAudioSource 
            ? JSON.parse(processedAudioSource)
            : getNodeOutput(inputNodes.find(n => n.data.type === 'audio-generation')?.data.name);

          if (!imageOutput || !audioOutput) {
            throw new Error('Video composition requires both image and audio inputs');
          }

          // Extract image URLs from the nested structure
          const imageUrls = Array.isArray(imageOutput) && imageOutput[0]?.imageUrls 
            ? imageOutput[0].imageUrls 
            : (Array.isArray(imageOutput) ? imageOutput : [imageOutput]);

          const videoPayload = {
            imageSources: imageUrls,
            audioSources: {
              audioUrl: audioOutput.audioUrl,
              audioDuration: audioOutput.duration || 30.00,
              type: audioOutput.type,
            },
            height: node.data.properties.height || 720,
            width: node.data.properties.width || 1280,
            topic: node.data.properties.topic || 'flow'
          };

          console.log('Sending video composition request:', videoPayload);
          
          response = await axios.post('http://localhost:3000/create-video-with-subtitles', videoPayload);
          if (response.data?.videoUrl) {
            response.data = {
              url: response.data.videoUrl,
              type: 'video'
            };
          }
          break;

        case 'text-generation':
          let processedPrompt = node.data.properties.prompt;
          if (processedPrompt) {
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
          }

          response = await axios.post('http://localhost:3000/chat-completion', {
            ...node.data.properties,
            prompt: processedPrompt,
            nodeId: node.id,
            nodeType: node.data.type
          });
          break;

        // audio wala yaha pe
        
        case 'image-generation':
          try {
            let processedPrompt = node.data.properties.prompt;
            if (processedPrompt) {
              const placeholderRegex = /{([^}]+)\.output}/g;
              processedPrompt = processedPrompt.replace(placeholderRegex, (match, nodeName) => {
                const sourceNode = nodes.find(n => n.data.name === nodeName);
                if (!sourceNode) {
                  console.warn(`Node "${nodeName}" not found`);
                  return match;
                }
                
                const output = getNodeOutput(nodeName);
                return output || match;
              });
            }

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

        case 'audio-generation':
          let processedProperties = { ...node.data.properties };
          if (processedProperties.text) {
            const placeholderRegex = /{([^}]+)\.output}/g;
            processedProperties.text = processedProperties.text.replace(placeholderRegex, (match, nodeName) => {
              const sourceNode = nodes.find(n => n.data.name === nodeName);
              if (!sourceNode) {
                console.warn(`Node "${nodeName}" not found`);
                return match;
              }
              
              const output = getNodeOutput(nodeName);
              return output || match;
            });
          }

          response = await axios.post('http://localhost:3000/audio-generation', {
            ...processedProperties,
            nodeId: node.id,
            nodeType: node.data.type
          });
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
    // Check if there are any nodes
    if (nodes.length === 0) {
      alert('Please add at least one node to the canvas before running the flow.');
      return;
    }

    // Check for blank prompts
    const nodeWithBlankPrompt = nodes.find(node => {
      const properties = node.data.properties || {};
      if (['text-generation', 'image-generation'].includes(node.data.type)) {
        return !properties.prompt || properties.prompt.trim() === '';
      }
      if (node.data.type === 'audio-generation') {
        return !properties.text || properties.text.trim() === '';
      }
      return false;
    });

    if (nodeWithBlankPrompt) {
      alert(`Please fill in the required prompt for node "${nodeWithBlankPrompt.data.name || 'Unnamed Node'}"`);
      return;
    }

    setIsRunning(true);
    try {
      // Get nodes in sequence order
      const orderedNodes = [...nodes];
      
      // Process each node in sequence
      for (const node of orderedNodes) {
        try {
          await processNode(node);
        } catch (error) {
          console.error(`Error processing node ${node.id}:`, error);
          alert(`Error processing node "${node.data.name || 'Unnamed Node'}": ${error.message}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error running flow:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveFlow = async (flowName) => {
    if (!flowName) return;
    
    const flowData = {
      name: flowName,
      data: {
        nodes,
        edges
      }
    };
    
    try {
      await axios.post('http://localhost:3000/api/flows', flowData);
      setDialogOpen(false);
      toast.success(`Flow "${flowName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error(`Failed to save flow: ${error.message}`);
    }
  };

  const handleImportFlow = (flow) => {
    if (!flow.data || !flow.data.nodes || !flow.data.edges) {
      toast.error('Invalid flow data structure');
      return;
    }
    
    setNodes(flow.data.nodes);
    setEdges(flow.data.edges);
    setDialogOpen(false);
    toast.success(`Flow "${flow.name}" imported successfully!`);
  };

  return (
    <>
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">GLIF Builder</h1>
          <Button 
            onClick={handleRun} 
            className="bg-black hover:bg-gray-800 min-w-[120px]"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Flow
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => {
              setDialogMode('save');
              setDialogOpen(true);
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Flow
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setDialogMode('import');
              setDialogOpen(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Flow
          </Button>
          <Button onClick={onAddNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </div>

      <FlowManagementDialog
        isOpen={dialogOpen}
        mode={dialogMode}
        onClose={(flowName) => {
          if (flowName) {
            handleSaveFlow(flowName);
          }
          setDialogOpen(false);
        }}
        onImport={handleImportFlow}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}