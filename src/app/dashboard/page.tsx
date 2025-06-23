"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import IAChatFloating from "@/components/common/IAChatFloating";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.emailVerified) {
        router.push("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Dashboard Malinoise</h1>
        <p className="mb-6">Bienvenido. Aquí irá el dashboard real y los módulos conectados a Firestore.</p>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Cerrar sesión</button>
      </div>
      <IAChatFloating />
    </>
  );
}
