import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  role: "user" | "ia";
  content: string;
}

export default function IAChat() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ia_chat_history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("ia_chat_history", JSON.stringify(history));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setHistory(h => [...h, { role: "user", content: question }]);
    try {
      const res = await fetch("/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setHistory(h => [...h, { role: "ia", content: data.answer || data.error || "No se pudo obtener respuesta." }]);
    } catch {
      setHistory(h => [...h, { role: "ia", content: "Error al consultar la IA" }]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  const handleClear = () => {
    setHistory([]);
    localStorage.removeItem("ia_chat_history");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-teal-700">Asistente IA Empresarial</span>
        <button onClick={handleClear} className="text-xs text-teal-600 hover:underline">Limpiar chat</button>
      </div>
      <div className="h-64 overflow-y-auto bg-slate-50 border rounded p-2 mb-2">
        {history.length === 0 && <div className="text-slate-400">¡Haz tu primera pregunta!</div>}
        {history.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-teal-100 text-teal-900" : "bg-white border text-slate-800"}`}>
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Pregunta sobre negocios, finanzas, inventario, etc."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded" disabled={loading || !question}>
          {loading ? "..." : "Enviar"}
        </button>
      </form>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}
