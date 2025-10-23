import { create } from "zustand";

// Toast notification type
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

// Modal state
interface ModalState {
  isOpen: boolean;
  component: React.ComponentType<any> | null;
  props?: Record<string, any>;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal
  modal: ModalState;
  openModal: (
    component: React.ComponentType<any>,
    props?: Record<string, any>
  ) => void;
  closeModal: () => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Sidebar (mobile)
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Toast state
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration ?? 5000;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Modal state
  modal: {
    isOpen: false,
    component: null,
    props: undefined,
  },

  openModal: (component, props) => {
    set({
      modal: {
        isOpen: true,
        component,
        props,
      },
    });
  },

  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        component: null,
        props: undefined,
      },
    });
  },

  // Global loading
  globalLoading: false,

  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },

  // Sidebar
  sidebarOpen: false,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  // Command palette
  commandPaletteOpen: false,

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  setCommandPaletteOpen: (open) => {
    set({ commandPaletteOpen: open });
  },
}));
