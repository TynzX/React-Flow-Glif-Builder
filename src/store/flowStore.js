import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
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
    set({
      edges: addEdge(connection, get().edges),
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

    set({
      nodes: [...get().nodes, newNode],
    });
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
}));