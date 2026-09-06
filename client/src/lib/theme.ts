export type ThemeMode = "light" | "dark";

// Keep this in sync with the inline script in app/layout.tsx.
export const THEME_STORAGE_KEY = "sb-theme";

/** Apply (or remove) the `.dark` class the CSS in globals.css keys off of. */
export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

/**
 * Apply a theme and persist it so it survives navigation, logout, and full
 * page reloads on the public site (not just inside a logged-in dashboard).
 */
export function setTheme(mode: ThemeMode) {
  applyTheme(mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // localStorage can throw in private browsing / disabled-storage contexts.
  }
}

export function getStoredTheme(): ThemeMode | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function getCurrentTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}