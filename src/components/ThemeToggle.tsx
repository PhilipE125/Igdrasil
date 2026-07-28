"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-10 md:size-14 items-center justify-center rounded-[8px] md:rounded-lg border border-input bg-layer-3 text-foreground btn-hover-overlay"
    >
      {mounted ? (
        isDark ? <Sun className="size-4 md:size-6" /> : <Moon className="size-4 md:size-6" />
      ) : (
        <Sun className="size-4 md:size-6 opacity-0" />
      )}
    </button>
  );
}
