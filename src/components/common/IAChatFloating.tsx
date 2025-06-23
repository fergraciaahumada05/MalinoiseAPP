import { useState } from "react";
import IAChat from "./IAChat";

export default function IAChatFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-teal-700 transition-all"
        aria-label={open ? "Cerrar chat IA" : "Abrir chat IA"}
      >
        {open ? "×" : <span role="img" aria-label="IA">🤖</span>}
      </button>
      {/* Ventana flotante del chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-full">
          <div className="bg-white rounded-lg shadow-xl border p-0">
            <div className="flex justify-between items-center px-4 py-2 border-b bg-teal-600 rounded-t-lg">
              <span className="text-white font-bold">Asistente IA Empresarial</span>
              <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</button>
            </div>
            <div className="p-4">
              <IAChat />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
