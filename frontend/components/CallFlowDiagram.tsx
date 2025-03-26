import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "react-flow-renderer";
import AIChat from "../components/AIChat";

export default function CallFlowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const fetchFlowData = async () => {
      const token = localStorage.getItem("rc_access_token");
      if (!token) {
        setError("Missing access token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/rc/call-flow", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch call flow.");
        }

        const data = await res.json();
        const records = data.records;
        const flowNodes: Node[] = [
          {
            id: "incoming",
            type: "input",
            data: { label: "📞 Incoming Call" },
            position: { x: 250, y: 25 },
          },
        ];

        const flowEdges: Edge[] = [];

        records.forEach((rule, index) => {
          const nodeId = rule.id;
          const label = rule.name || rule.type;
          const isDisabled = rule.enabled === false;

          const node: Node = {
            id: nodeId,
            data: {
              label: isDisabled ? `❌ ${label}` : `✅ ${label}`,
            },
            position: { x: 250, y: 120 + index * 120 },
            style: {
              background: isDisabled ? "#fdecea" : "#f0fdf4",
              border: `1px solid ${isDisabled ? "#f5c2c7" : "#86efac"}`,
              color: isDisabled ? "#b02a37" : "#166534",
              padding: 10,
              borderRadius: 10,
              fontWeight: 500,
              cursor: "pointer",
            },
          };

          flowNodes.push(node);

          flowEdges.push({
            id: `edge-${index}`,
            source: index === 0 ? "incoming" : records[index - 1].id,
            target: nodeId,
            animated: true,
            style: { stroke: isDisabled ? "#f87171" : "#4ade80" },
          });
        });

        flowNodes.push({
          id: "end",
          type: "output",
          data: { label: "📥 Destination (VM, Ring Group, etc.)" },
          position: { x: 250, y: 150 + records.length * 120 },
        });

        if (records.length > 0) {
          flowEdges.push({
            id: "edge-to-end",
            source: records[records.length - 1].id,
            target: "end",
            animated: true,
            style: { stroke: "#60a5fa" },
          });
        }

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load call flow.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlowData();
  }, []);

  if (loading) return <p>Loading call flow...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div style={{ height: 600, width: "100%", background: "#f9fafb" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          <MiniMap />
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Selected Node</h2>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Label:</strong> {selectedNode.data?.label}</p>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      )}

      <div className="mt-6">
        <AIChat />
      </div>
    </div>
  );
}
