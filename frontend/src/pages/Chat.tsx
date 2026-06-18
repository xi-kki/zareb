import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { chat } from "../api/client";

const SUGGESTED_QUESTIONS = [
  "What's my biggest compliance risk right now?",
  "What do I need to fix before a BRCGS audit?",
  "Explain what HACCP Critical Control Points I'm missing",
  "What does an EU importer need from me?",
];

export default function ChatPage() {
  const { reportId } = useParams();
  const [messages, setMessages] = useState<Array<{ role: "user" | "zareb"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!message.trim() || isStreaming) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsStreaming(true);
    setChatStarted(true);

    // Add a placeholder for Zareb's response
    setMessages((prev) => [...prev, { role: "zareb", content: "" }]);

    try {
      const response = await chat.send(message, reportId);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              accumulated += data;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "zareb", content: accumulated };
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "zareb", content: "Sorry, I couldn't process that. Please try again." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#111827]">Zareb Chat</h1>
          <p className="text-xs text-[#6B7280]">Ask questions about your compliance reports</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">Ask Zareb anything</h2>
            <p className="text-[#6B7280] mb-6 max-w-md">
              I've analyzed your compliance documents. Ask me about gaps, next steps, or specific regulations.
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#111827] hover:border-primary hover:bg-primary-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "zareb" && (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 rounded-tl-sm"
                }`}
              >
                <p className={`text-sm whitespace-pre-wrap ${msg.role === "user" ? "text-white" : "text-[#111827]"}`}>
                  {msg.content || (msg.role === "zareb" && i === messages.length - 1 && isStreaming ? (
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : (
                    ""
                  ))}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#6B7280]" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Type your question..."
          disabled={isStreaming}
          className="input-field flex-1"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isStreaming}
          className="btn-primary px-4 flex items-center justify-center disabled:opacity-50"
        >
          {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
