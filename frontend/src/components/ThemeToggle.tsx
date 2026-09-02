import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "./ui/Button";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "dark" ? "#05080c" : "#f4f7fb",
    );
    localStorage.setItem("theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={theme === "dark" ? "עבור למצב בהיר" : "עבור למצב כהה"}
      title={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
      onClick={() => setTheme(nextTheme)}
    >
      {theme === "dark" ? <Sun size={18} weight="duotone" /> : <Moon size={18} weight="duotone" />}
    </Button>
  );
}
