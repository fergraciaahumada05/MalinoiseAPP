"use client";
import { useEffect } from "react";

export default function ThemeScript() {
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);
  return null;
}
