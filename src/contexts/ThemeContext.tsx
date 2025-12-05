import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setIsDarkMode((prev) => !prev);
      return;
    }

    const nextThemeIsDark = !isDarkMode;
    document.documentElement.dataset.transitionDirection = nextThemeIsDark ? 'to-dark' : 'to-light';

    const transition = document.startViewTransition(() => {
      setIsDarkMode(nextThemeIsDark);
    });

    transition.finished.finally(() => {
      delete document.documentElement.dataset.transitionDirection;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
