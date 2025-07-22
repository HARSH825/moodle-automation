import { useEffect } from "react";

export function useTheme(theme = "dark") {
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);
}
