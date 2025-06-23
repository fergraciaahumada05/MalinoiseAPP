"use client";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { updateProfile, updatePassword, deleteUser, onAuthStateChanged, User } from "firebase/auth";

export default function ConfiguracionUsuario() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setDisplayName(u?.displayName || "");
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (user && displayName) {
      try {
        await updateProfile(user, { displayName });
        setSuccess("Perfil actualizado");
      } catch {
        setError("Error al actualizar perfil");
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (user && password.length >= 6) {
      try {
        await updatePassword(user, password);
        setSuccess("Contraseña actualizada");
        setPassword("");
      } catch {
        setError("Error al cambiar contraseña");
      }
    } else {
      setError("La contraseña debe tener al menos 6 caracteres");
    }
  };

  const handleDeleteAccount = async () => {
    setError(""); setSuccess("");
    if (user) {
      try {
        await deleteUser(user);
        setSuccess("Cuenta eliminada. Se cerrará la sesión.");
      } catch {
        setError("Error al eliminar la cuenta. Reautentica e inténtalo de nuevo.");
      }
    }
  };

  if (!user) return <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">Cargando usuario...</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow space-y-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">Configuración de Usuario</h2>
      {success && <div className="mb-2 text-green-600">{success}</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <form onSubmit={handleUpdateProfile} className="space-y-3">
        <label className="block font-semibold" htmlFor="displayName">Nombre de usuario</label>
        <input id="displayName" type="text" className="w-full border rounded p-2" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nombre de usuario" title="Nombre de usuario" />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Actualizar perfil</button>
      </form>
      <form onSubmit={handleChangePassword} className="space-y-3">
        <label className="block font-semibold" htmlFor="newPassword">Nueva contraseña</label>
        <input id="newPassword" type="password" className="w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} minLength={6} placeholder="Nueva contraseña" title="Nueva contraseña" />
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Cambiar contraseña</button>
      </form>
      <div className="space-y-2">
        <button onClick={() => setConfirmDelete(true)} className="bg-red-600 text-white px-4 py-2 rounded">Eliminar cuenta</button>
        {confirmDelete && (
          <div className="bg-red-100 p-3 rounded mt-2">
            <p>¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.</p>
            <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-3 py-1 rounded mt-2 mr-2">Sí, eliminar</button>
            <button onClick={() => setConfirmDelete(false)} className="bg-gray-300 px-3 py-1 rounded mt-2">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}
