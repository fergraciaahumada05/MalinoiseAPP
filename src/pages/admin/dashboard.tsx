import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

interface Gasto {
  id: number;
  descripcion: string;
  categoria: string;
  monto: number;
  fecha: string;
}

interface Venta {
  id: number;
  cantidad: number;
  total: number;
  fecha: string;
  producto: { nombre: string };
  cliente: { nombre: string } | null;
}

const currencyOptions = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "MXN", symbol: "$" },
  { code: "GBP", symbol: "£" },
];
const languageOptions = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

export default function DashboardAdmin() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [iaAdvice, setIaAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAdvice, setCustomAdvice] = useState<string>("");
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [language, setLanguage] = useState(languageOptions[0]);

  // Conversión simple de divisas (puedes conectar a una API real si lo deseas)
  const currencyRates: Record<string, number> = { EUR: 1, USD: 1.08, MXN: 19, GBP: 0.85 };

  useEffect(() => {
    fetch("/api/admin/gastos").then(r => r.json()).then(setGastos);
    fetch("/api/admin/ventas").then(r => r.json()).then(setVentas);
  }, []);

  useEffect(() => {
    // Detección simple de anomalías: gastos > 2x promedio
    if (gastos.length > 0) {
      const avg = gastos.reduce((a, b) => a + b.monto, 0) / gastos.length;
      const anomalous = gastos.filter(g => g.monto > avg * 2).map(g => `Gasto alto: ${g.descripcion} - $${g.monto}`);
      setAnomalies(anomalous);
    }
  }, [gastos]);

  // Solicitar consejo de IA automáticamente al cargar datos
  useEffect(() => {
    if (gastos.length > 0 && ventas.length > 0) {
      setLoadingAdvice(true);
      fetch("/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Analiza estos datos de gastos: ${JSON.stringify(gastos.slice(-10))} y ventas: ${JSON.stringify(ventas.slice(-10))}. Dame consejos financieros, alertas de riesgo y oportunidades de mejora para mi negocio, en español y en menos de 100 palabras.`
        })
      })
        .then(r => r.json())
        .then(data => setIaAdvice(data.answer || "No se pudo obtener consejo de la IA."))
        .catch(() => setIaAdvice("Error al consultar la IA"))
        .finally(() => setLoadingAdvice(false));
    }
  }, [gastos, ventas]);

  const handleCustomAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCustom(true);
    setCustomAdvice("");
    try {
      const res = await fetch("/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${customQuestion} Datos recientes: gastos: ${JSON.stringify(gastos.slice(-10))}, ventas: ${JSON.stringify(ventas.slice(-10))}. Responde en español y en menos de 100 palabras.`
        })
      });
      const data = await res.json();
      setCustomAdvice(data.answer || "No se pudo obtener consejo de la IA.");
    } catch {
      setCustomAdvice("Error al consultar la IA");
    } finally {
      setLoadingCustom(false);
    }
  };

  const exportAdviceToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Consejo de IA Empresarial", 10, 15);
    doc.setFontSize(12);
    doc.text("Consejo automático:", 10, 30);
    doc.text(iaAdvice || "Sin consejo", 10, 38, { maxWidth: 180 });
    if (customAdvice) {
      doc.text("\nPregunta personalizada:", 10, 55);
      doc.text(customQuestion, 10, 63, { maxWidth: 180 });
      doc.text("Respuesta IA:", 10, 75);
      doc.text(customAdvice, 10, 83, { maxWidth: 180 });
    }
    doc.save(`consejo-ia-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportAdviceToCSV = () => {
    let csv = 'Tipo,Contenido\n';
    csv += `Consejo automático,"${iaAdvice.replace(/"/g, '""')}"\n`;
    if (customAdvice && customQuestion) {
      csv += `Pregunta personalizada,"${customQuestion.replace(/"/g, '""')}"\n`;
      csv += `Respuesta IA,"${customAdvice.replace(/"/g, '""')}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `consejo-ia-${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Prepara los datos para Recharts
  const gastosChartData = gastos.map(g => ({
    descripcion: g.descripcion,
    monto: g.monto * (currencyRates[currency.code] || 1)
  }));
  const ventasChartData = ventas.map(v => ({
    fecha: new Date(v.fecha).toLocaleDateString(language.code),
    total: v.total * (currencyRates[currency.code] || 1)
  }));

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Dashboard Analítico</h2>
      <div className="flex gap-4 mb-6">
        <div>
          <label htmlFor="currency-select" className="block text-xs font-bold mb-1">Divisa</label>
          <select
            id="currency-select"
            value={currency.code}
            onChange={e => setCurrency(currencyOptions.find(c => c.code === e.target.value) || currencyOptions[0])}
            className="border rounded p-1"
          >
            {currencyOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.code} {opt.symbol}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="language-select" className="block text-xs font-bold mb-1">Idioma</label>
          <select
            id="language-select"
            value={language.code}
            onChange={e => setLanguage(languageOptions.find(l => l.code === e.target.value) || languageOptions[0])}
            className="border rounded p-1"
          >
            {languageOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gastosChartData}>
              <XAxis dataKey="descripcion" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="monto" name={language.code === "en" ? "Amount" : "Monto"} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasChartData}>
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="total" name={language.code === "en" ? "Total" : "Total"} stroke="#0f766e" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {anomalies.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
          <strong>{language.code === "en" ? "Detected anomalies:" : "Anomalías detectadas:"}</strong>
          <ul className="list-disc ml-6">
            {anomalies.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-900">
        <div className="flex items-center justify-between mb-2">
          <strong>{language.code === "en" ? "AI Advice:" : "Consejo de IA:"}</strong>
          <div className="flex gap-2">
            <button onClick={exportAdviceToPDF} className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">{language.code === "en" ? "Export PDF" : "Exportar PDF"}</button>
            <button onClick={exportAdviceToCSV} className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700">{language.code === "en" ? "Export CSV" : "Exportar CSV"}</button>
          </div>
        </div>
        {loadingAdvice ? (
          <span className="ml-2 animate-pulse">Consultando IA...</span>
        ) : (
          <span className="ml-2">{iaAdvice}</span>
        )}
        <form onSubmit={handleCustomAdvice} className="mt-4 flex gap-2">
          <input
            className="border rounded p-2 flex-1"
            placeholder={language.code === "en" ? "Ask a custom question to the AI..." : "Haz una pregunta personalizada a la IA..."}
            value={customQuestion}
            onChange={e => setCustomQuestion(e.target.value)}
            disabled={loadingCustom}
            required
          />
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded" disabled={loadingCustom || !customQuestion}>
            {loadingCustom ? "..." : language.code === "en" ? "Ask" : "Preguntar"}
          </button>
        </form>
        {customAdvice && (
          <div className="mt-2 p-2 bg-white border rounded text-slate-800">
            <strong>{language.code === "en" ? "AI Response:" : "Respuesta IA:"}</strong> {customAdvice}
          </div>
        )}
      </div>
    </div>
  );
}
