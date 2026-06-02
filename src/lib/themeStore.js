import { create } from 'zustand';

export const useTheme = create((set) => ({
  theme: 'dark',

  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme-preference', theme);
    set({ theme });
  },

  initTheme: () => {
    const saved = localStorage.getItem('theme-preference');
    const theme = saved || 'dark';
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme-preference', next);
      return { theme: next };
    });
  },
}));
