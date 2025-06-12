import React from "react";

interface Props {
  chatHistory: { role: string; content: string }[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onSend: () => void;
  chatLoading: boolean;
}

const Chat: React.FC<Props> = ({
  chatHistory,
  chatInput,
  setChatInput,
  onSend,
  chatLoading,
}) => (
  <div>
    <h2 className="text-xl font-bold mb-2">Chat with Gemini</h2>
    <div className="border p-4 h-80 overflow-y-auto bg-gray-100 space-y-2 mb-4">
      {chatHistory.map((msg, idx) => (
        <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
          <span className={`inline-block px-3 py-2 rounded ${msg.role === "user" ? "bg-blue-200" : "bg-green-200"}`}>
            {msg.content}
          </span>
        </div>
      ))}
    </div>
    <div className="flex space-x-2">
      <input
        className="border p-2 flex-1"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Ask something..."
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button
        onClick={onSend}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={chatLoading}
      >
        {chatLoading ? "Sending..." : "Send"}
      </button>
    </div>
  </div>
);

export default Chat;
