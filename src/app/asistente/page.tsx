"use client";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Asistente() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: "assistant", content: data.content || "[Sin respuesta de la IA]" }]);
    } catch {
      setMessages(msgs => [...msgs, { role: "assistant", content: "[Error al conectar con la IA]" }]);
    } finally {
      setLoading(false);
    }
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow flex flex-col h-[70vh]">
      <h2 className="text-2xl font-bold mb-4">Asistente IA</h2>
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-3 bg-slate-50">
        {messages.length === 0 && <div className="text-slate-400">Inicia la conversación con tu asistente...</div>}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
            <span className={msg.role === "user" ? "inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded" : "inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded"}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-slate-400">Pensando...</div>}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-2"
          placeholder="Escribe tu pregunta o instrucción..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded" disabled={loading || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
