import { create } from 'zustand';

interface UIStore {
  theme: 'light' | 'dark';
  language: 'en' | 'uz';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'uz') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('language') as 'en' | 'uz') || 'uz',
  sidebarOpen: true,
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  setLanguage: (language: 'en' | 'uz') => {
    localStorage.setItem('language', language);
    set({ language });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
