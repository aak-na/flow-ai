import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Custom Edge with Delete Button
const ButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={20}
        height={20}
        x={labelX - 10}
        y={labelY - 10}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button className="edgebutton" onClick={(event) => {
          event.stopPropagation();
          data.onDelete(id);
        }}>
          ×
        </button>
      </foreignObject>
    </>
  );
};

// Custom Input Node
function InputNode({ data }) {
  return (
    <div className="custom-node input-node">
      <button className="delete-node-btn" onClick={() => data.onDelete(data.id)}>×</button>
      <label>Prompt</label>
      <textarea 
        placeholder="Type your prompt here..."
        value={data.prompt}
        onChange={(evt) => data.onChange(evt, data.id)}
      ></textarea>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Custom Result Node
function ResultNode({ data }) {
  return (
    <div className="custom-node result-node">
      <button className="delete-node-btn" onClick={() => data.onDelete(data.id)}>×</button>
      <Handle type="target" position={Position.Left} />
      <label>AI Response</label>
      <div className="result-text">{data.response || 'Waiting for input...'}</div>
    </div>
  );
}

const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

const initialNodes = [
  {
    id: '1',
    type: 'inputNode',
    position: { x: 100, y: 150 },
    data: { id: '1', prompt: 'What is the capital of France?' }
  },
  {
    id: '2',
    type: 'resultNode',
    position: { x: 500, y: 150 },
    data: { response: '' }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'buttonEdge', animated: true }
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle input change for specific node
  const handleInputChange = useCallback((evt, id) => {
    const val = evt.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, prompt: val }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    showToast('Node removed');
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((id) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
    showToast('Connection removed');
  }, [setEdges]);

  // Inject handlers into node and edge data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        return {
          ...node,
          data: { 
            ...node.data, 
            onChange: node.type === 'inputNode' ? handleInputChange : undefined,
            onDelete: deleteNode,
            id: node.id 
          }
        };
      })
    );
  }, [handleInputChange, deleteNode, setNodes]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        return {
          ...edge,
          data: { ...edge.data, onDelete: deleteEdge }
        };
      })
    );
  }, [deleteEdge, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'buttonEdge', 
      animated: true, 
      data: { onDelete: deleteEdge } 
    }, eds)),
    [setEdges, deleteEdge]
  );

  const addNode = (type) => {
    const id = `${nodes.length + 1}`;
    const newNode = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        id,
        prompt: type === 'inputNode' ? '' : undefined,
        response: type === 'resultNode' ? '' : undefined,
        onChange: handleInputChange
      }
    };
    setNodes((nds) => nds.concat(newNode));
    showToast(`Added new ${type === 'inputNode' ? 'Input' : 'Result'} node`);
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const runFlow = async () => {
    setLoading(true);
    // Find the first input node that has a connected result node
    // Simple logic for now: process all connected pairs
    const connectedEdges = edges;
    let processedAny = false;

    for (const edge of connectedEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source && n.type === 'inputNode');
      const targetNode = nodes.find(n => n.id === edge.target && n.type === 'resultNode');

      if (sourceNode && targetNode && sourceNode.data.prompt) {
        processedAny = true;
        try {
          const res = await fetch(`${BACKEND_URL}/api/ask-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: sourceNode.data.prompt })
          });
          const data = await res.json();
          
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === targetNode.id) {
                return { ...node, data: { ...node.data, response: data.response || data.error } };
              }
              return node;
            })
          );
        } catch (error) {
          console.error(error);
          showToast(`Error processing node ${targetNode.id}`, 'error');
        }
      }
    }

    if (!processedAny) {
      showToast('Connect an Input node with a prompt to a Result node first!', 'error');
    }
    setLoading(false);
  };

  const saveFlow = async () => {
    const promptNode = nodes.find(n => n.id === '1');
    const resultNode = nodes.find(n => n.id === '2');
    
    if (!promptNode.data.prompt || !resultNode.data.response) {
      showToast('Please run the flow and get a response before saving.', 'error');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptNode.data.prompt,
          response: resultNode.data.response
        })
      });
      
      const data = await res.json();
      if(res.ok) {
        showToast('Saved successfully ', 'success');
      } else {
        showToast(data.error || 'Failed to save to database', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server.', 'error');
    }
  };

  const clearConnections = () => {
    setEdges([]);
    showToast('All connections cleared!');
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1 className="logo">AI Flow Builder</h1>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => addNode('inputNode')}>+ Add Input</button>
          <button className="btn btn-secondary" onClick={() => addNode('resultNode')}>+ Add Result</button>
          <button className="btn btn-outline-danger" onClick={clearConnections}>Clear Edges</button>
          <div className="divider"></div>
          <button className="btn btn-primary" onClick={runFlow} disabled={loading}>
            {loading ? 'Thinking...' : 'Run Flow'}
          </button>
          <button className="btn btn-secondary" onClick={saveFlow}>Save</button>
        </div>
      </header>
      <div className="flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#333" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
