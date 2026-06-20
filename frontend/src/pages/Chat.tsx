import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Leaf } from "lucide-react";
import { chat as chatApi } from "../api/client";

const SUGGESTED_QUESTIONS = [
  "What's my biggest compliance risk right now?",
  "What do I need to fix before a BRCGS audit?",
  "Explain what HACCP Critical Control Points I'm missing",
  "What does an EU importer need from me?",
];

function ChatMessage({ role, content, isStreaming, isLast }: {
  role: "user" | "zareb";
  content: string;
  isStreaming: boolean;
  isLast: boolean;
}) {
  return (
    <div className={`flex gap-3 ${role === "user" ? "justify-end" : ""}`}>
      {role === "zareb" && (
        <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
          role === "user"
            ? "bg-brand text-white rounded-tr-md shadow-sm"
            : "bg-white border border-stone-200 rounded-tl-md shadow-soft"
        }`}
      >
        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${role === "user" ? "text-white" : "text-stone-800"}`}>
          {content || (role === "zareb" && isLast && isStreaming ? (
            <span className="inline-flex gap-1">
              <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          ) : (
            ""
          ))}
        </p>
      </div>
      {role === "user" && (
        <div className="w-9 h-9 bg-stone-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-stone-500" />
        </div>
      )}
    </div>
  );
}

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

    setMessages((prev) => [...prev, { role: "zareb", content: "" }]);

    try {
      const response = await chatApi.send(message, reportId);
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
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
        <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-700 rounded-xl flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-stone-900">Zareb Chat</h1>
          <p className="text-sm text-stone-500">Ask questions about your compliance reports</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-1">
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-cream-200 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-brand" />
            </div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">Ask Zareb anything</h2>
            <p className="text-stone-500 mb-8 max-w-md">
              I've analyzed your compliance documents. Ask me about gaps, next steps, or specific regulations.
            </p>
            <div className="grid gap-2.5 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left px-5 py-3.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-brand/30 hover:bg-brand-50/50 transition-all duration-150 shadow-soft hover:shadow-card"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming}
              isLast={i === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-white rounded-2xl border border-stone-200 p-2 shadow-soft">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Type your question..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 bg-transparent text-stone-900 placeholder:text-stone-400 outline-none text-sm"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isStreaming}
          className="btn-primary !py-2.5 !px-5 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Send <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
