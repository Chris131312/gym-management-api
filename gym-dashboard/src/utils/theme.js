const THEME_KEY = "gym_os_theme";

export const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || "light";
};

export const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

export const initTheme = () => {
  setTheme(getTheme());
};
