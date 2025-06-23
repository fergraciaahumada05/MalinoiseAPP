"use client";
import { useState } from "react";
import { auth } from "@/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Recuperar Contraseña</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>
        {loading ? "Enviando..." : "Enviar correo de recuperación"}
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </form>
  );
}
