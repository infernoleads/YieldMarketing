// client/src/components/MessagePanel.jsx
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { messagesApi } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { timeAgo } from "@/lib/utils";
import { Spinner } from "./ui";

export default function MessagePanel({ conversationId, title }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = async () => {
    try {
      const { messages } = await messagesApi.list(conversationId);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    load();
    const t = setInterval(load, 5000); // lightweight polling
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    setText("");
    try {
      const { message } = await messagesApi.create({ conversationId, content });
      setMessages((m) => [...m, message]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card flex flex-col" style={{ height: 520 }}>
      {title && (
        <div className="px-4 py-3 font-display font-semibold text-sm" style={{ borderBottom: "1px solid var(--border-2)", color: "var(--text)" }}>
          {title}
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? <Spinner /> : messages.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-3)" }}>No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender?.id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  {!mine && <div className="text-xs mb-1 px-1" style={{ color: "var(--text-muted)" }}>{m.sender?.fullName}</div>}
                  <div className="px-3.5 py-2.5 rounded-2xl text-sm" style={{
                    background: mine ? "var(--lime-500)" : "var(--surface-2)",
                    color: mine ? "var(--ink)" : "var(--text)",
                    border: mine ? "none" : "1px solid var(--border-2)",
                  }}>
                    {m.content}
                  </div>
                  <div className="text-[10px] mt-1 px-1" style={{ color: "var(--text-muted)", textAlign: mine ? "right" : "left" }}>
                    {timeAgo(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--border-2)" }}>
        <input
          className="input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
        />
        <button className="btn btn-primary" onClick={send} disabled={sending || !text.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
