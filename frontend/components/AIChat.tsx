import { useState } from "react";
import axios from "axios";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null); // GPT-suggested action

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setPendingAction(null);

    const token = localStorage.getItem("rc_access_token");

    try {
      const res = await axios.post(
        "http://localhost:8000/ai/command",  // ✅ Correct backend route
        { prompt: input },  // Also change `message` to `prompt` to match backend
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiReply: Message = { sender: "ai", text: res.data.response };
      setMessages((prev) => [...prev, aiReply]);

      if (res.data.action) {
        setPendingAction(res.data.action);

        const actionText =
            res.data.action.type === "callForwarding"
                ? `📞 I’m ready to forward your calls to ${res.data.action.payload.destination}. Would you like to proceed?`
                : `⚙️ I’ve prepared an action of type "${res.data.action.type}". Ready to apply it?`;

        setMessages((prev) => [...prev, { sender: "ai", text: actionText }]);
        }

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const approveAction = async () => {
    if (!pendingAction) return;
    const token = localStorage.getItem("rc_access_token");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/ai/execute",
        pendingAction,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "✅ Action executed successfully." }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Failed to execute action." }
      ]);
    } finally {
      setPendingAction(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded shadow p-4 mt-6">
      <h2 className="text-lg font-semibold mb-2">AI Assistant</h2>

      <div className="h-64 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {pendingAction && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={approveAction}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Approve & Run
          </button>
        </div>
      )}

      <div className="flex">
        <input
          type="text"
          className="flex-1 border rounded-l px-4 py-2"
          placeholder="What would you like to change?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-r"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

