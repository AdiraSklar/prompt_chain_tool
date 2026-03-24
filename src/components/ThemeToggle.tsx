"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex w-fit items-center gap-0.5 rounded-lg bg-zinc-800 p-1">
      <ThemeButton
        active={theme === "light"}
        onClick={() => setTheme("light")}
        title="Light mode"
      >
        <SunIcon />
      </ThemeButton>
      <ThemeButton
        active={theme === "dark"}
        onClick={() => setTheme("dark")}
        title="Dark mode"
      >
        <MoonIcon />
      </ThemeButton>
    </div>
  );
}

function ThemeButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center rounded-md w-7 h-7 transition-all ${
        active
          ? "bg-zinc-100 text-zinc-900 shadow-sm"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}
