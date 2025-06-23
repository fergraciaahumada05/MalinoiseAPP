"use client";
import { useState } from "react";
import { auth } from "@/firebase/config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, telefono })
      });
      setSuccess("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <input
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={telefono}
        onChange={e => setTelefono(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {success && <div className="mt-2 text-green-600">{success}</div>}
    </form>
  );
}
