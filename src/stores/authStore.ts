import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario } from '../tipos';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  iniciarSesion: (usuario: Usuario, token: string) => void;
  cerrarSesion: () => void;
  setUsuario: (usuario: Usuario) => void;
}

/**
 * Authentication store using Zustand with persistence
 * Stores user data and JWT token
 * Implements RF-FE-005, RF-FE-006, RF-FE-007
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      estaAutenticado: false,

      iniciarSesion: (usuario: Usuario, token: string) => {
        set({
          usuario,
          token,
          estaAutenticado: true,
        });
      },

      cerrarSesion: () => {
        set({
          usuario: null,
          token: null,
          estaAutenticado: false,
        });
      },

      setUsuario: (usuario: Usuario) => {
        set({ usuario });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        estaAutenticado: state.estaAutenticado,
      }),
    }
  )
);
