"use client";
import { useState } from "react";
import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setError("Verifica tu correo electrónico antes de continuar. Se ha reenviado el email de verificación.");
        return;
      }
      // Guardar usuario en la base de datos si es la primera vez que inicia sesión y está verificado
      await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userCredential.user.email, nombre: userCredential.user.displayName || '' })
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
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
      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </form>
  );
}
