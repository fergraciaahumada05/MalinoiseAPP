"use client";
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

export default function NavbarClient() {
  // ...aquí va el resto del código de Navbar.tsx...
  // Puedes copiar el contenido de tu Navbar original aquí.
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 bg-teal-600 text-white shadow">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-bold text-lg">Malinoise</Link>
        <Link href="/analitica">Analítica</Link>
        <Link href="/clientes">Clientes</Link>
        <Link href="/ventas">Ventas</Link>
        <Link href="/gastos">Gastos</Link>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </nav>
  );
}
