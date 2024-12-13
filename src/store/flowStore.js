import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from 'reactflow';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFlowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeOutputs: {},

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#374151',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#374151',
      },
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },
  addNewNode: (type, position) => {
    const newNode = {
      id: generateId(),
      type: 'custom',
      position,
      data: {
        type,
        name: '',
        properties: {},
        onChange: (properties) => {
          if (properties.name !== undefined) {
            get().updateNodeName(newNode.id, properties.name);
          } else {
            get().updateNodeProperties(newNode.id, properties);
          }
        },
      },
    };

    set(state => ({
      nodes: [...state.nodes, newNode],
    }));

    // Connect nodes after adding a new one
    get().connectNodesInSequence();
  },
  updateNodeName: (nodeId, name) => {
    // Check for duplicate names
    const existingNode = get().nodes.find(
      node => node.data.name === name && node.id !== nodeId
    );
    if (existingNode) {
      throw new Error('A node with this name already exists');
    }

    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, name } }
          : node
      ),
    });
  },
  getNodeByName: (name) => {
    return get().nodes.find(node => node.data.name === name);
  },
  updateNodeProperties: (nodeId, properties) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, properties } }
          : node
      ),
    });
  },
  setNodeOutput: (nodeId, output) => {
    set(state => ({
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: output
      }
    }));
  },
  getNodeOutput: (nodeName) => {
    const node = get().nodes.find(n => n.data.name === nodeName);
    if (!node) return null;
    return get().nodeOutputs[node.id];
  },
  updateNodeSequence: (newSequence) => {
    set((state) => ({
      ...state,
      nodes: newSequence.map((node, index) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data }
      }))
    }));
  },
  deleteSelectedNodes: () => {
    const selectedNodes = get().nodes.filter(node => node.selected);
    const selectedNodeIds = selectedNodes.map(node => node.id);
    
    set(state => ({
      nodes: state.nodes.filter(node => !selectedNodeIds.includes(node.id)),
      edges: state.edges.filter(
        edge => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
      ),
      nodeOutputs: Object.fromEntries(
        Object.entries(state.nodeOutputs).filter(([id]) => !selectedNodeIds.includes(id))
      )
    }));
  },
  getNodesInSequence: () => {
    return get().nodes;
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  connectNodesInSequence: () => {
    const nodes = get().nodes;
    if (nodes.length < 2) return;

    // Clear existing edges
    set({ edges: [] });

    // Create new edges based on sequence
    const newEdges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];

      newEdges.push({
        id: `${sourceNode.id}-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#374151',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#374151',
        },
      });
    }

    set({ edges: newEdges });
  },
}));