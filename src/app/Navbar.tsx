'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/config";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setDark(saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };
  return (
    <button onClick={toggle} className="ml-2 p-2 rounded hover:bg-teal-700 transition-colors" title="Cambiar modo claro/oscuro">
      {dark ? <span aria-label="Modo claro" role="img">🌞</span> : <span aria-label="Modo oscuro" role="img">🌙</span>}
    </button>
  );
}

function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <nav className="w-full bg-teal-600 text-white py-3 px-6 flex gap-4 items-center">
      <Link href="/dashboard" className={pathname === "/dashboard" ? "font-bold underline" : ""}>Dashboard</Link>
      <Link href="/ventas" className={pathname === "/ventas" ? "font-bold underline" : ""}>Ventas</Link>
      <Link href="/inventario" className={pathname === "/inventario" ? "font-bold underline" : ""}>Inventario</Link>
      <Link href="/clientes" className={pathname === "/clientes" ? "font-bold underline" : ""}>Clientes</Link>
      <Link href="/gastos" className={pathname === "/gastos" ? "font-bold underline" : ""}>Gastos</Link>
      <Link href="/analitica" className={pathname === "/analitica" ? "font-bold underline" : ""}>Analítica</Link>
      <Link href="/asistente" className={pathname === "/asistente" ? "font-bold underline" : ""}>Asistente IA</Link>
      <Link href="/configuracion" className={pathname === "/configuracion" ? "font-bold underline" : ""}>Configuración</Link>
      <span className="ml-auto flex items-center gap-2">{user.email}<ThemeToggle /></span>
    </nav>
  );
}

export default Navbar;
