/**
 * useRaiting.ts
 * Hook reutilizable que encapsula toda la lógica de red del sistema de medallas.
 * Separa el estado y las llamadas HTTP del componente visual RaitingMedallas.tsx.
 *
 * Uso:
 *   const { resumen, miRaiting, seleccion, cargando, enviando, error,
 *           seleccionarMedalla, recargar } = useRaiting({ recetaId, token });
 */

import { useState, useEffect, useCallback } from 'react';
import type { RaitingDto, RaitingResumen } from './RaitingMedallas';

// ─── Configuración base ────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api/raiting';

// ─── Tipos de retorno del hook ─────────────────────────────────────────────

export interface UseRaitingOptions {
  recetaId: number;
  token?: string;
  onCambiado?: (resumen: RaitingResumen) => void;
}

export interface UseRaitingReturn {
  /** Resumen público: promedio, votos, distribución */
  resumen: RaitingResumen | null;
  /** Voto actual del usuario autenticado (null si no ha votado) */
  miRaiting: RaitingDto | null;
  /** Medalla seleccionada (1-5), null si aún no hay selección */
  seleccion: number | null;
  /** true mientras se cargan los datos inicial */
  cargando: boolean;
  /** true mientras se envía/actualiza un voto */
  enviando: boolean;
  /** Mensaje de error, null si todo está bien */
  error: string | null;
  /** Selecciona o cambia la medalla del usuario */
  seleccionarMedalla: (nivel: number) => Promise<void>;
  /** Recarga el resumen y el voto del usuario */
  recargar: () => Promise<void>;
}

// ─── Hook principal ────────────────────────────────────────────────────────

export function useRaiting({
  recetaId,
  token,
  onCambiado,
}: UseRaitingOptions): UseRaitingReturn {
  const [resumen, setResumen] = useState<RaitingResumen | null>(null);
  const [miRaiting, setMiRaiting] = useState<RaitingDto | null>(null);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Helpers de fetch ──────────────────────────────────────────────────────

  const fetchResumen = useCallback(async (): Promise<RaitingResumen | null> => {
    const res = await fetch(`${API_BASE}/receta/${recetaId}/resumen`);
    if (!res.ok) throw new Error('No se pudo cargar el resumen de valoraciones.');
    return res.json();
  }, [recetaId]);

  const fetchMiVoto = useCallback(
    async (): Promise<RaitingDto | null> => {
      if (!token) return null;
      const res = await fetch(`${API_BASE}/mio/${recetaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null; // aún no ha votado
      if (!res.ok) throw new Error('No se pudo obtener tu valoración.');
      return res.json();
    },
    [recetaId, token],
  );

  // ── Carga inicial ─────────────────────────────────────────────────────────

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [resData, mioData] = await Promise.all([
        fetchResumen(),
        fetchMiVoto(),
      ]);
      if (resData) setResumen(resData);
      setMiRaiting(mioData);
      if (mioData) setSeleccion(mioData.puntuacion);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar valoraciones.');
    } finally {
      setCargando(false);
    }
  }, [fetchResumen, fetchMiVoto]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // ── Seleccionar / actualizar medalla ──────────────────────────────────────

  const seleccionarMedalla = useCallback(
    async (nivel: number) => {
      if (!token) throw new Error('LOGIN_REQUIRED');
      if (enviando) return;
      if (seleccion === nivel) return; // ya tiene ese nivel

      const esCambio = miRaiting !== null;
      const prevSeleccion = seleccion;
      setEnviando(true);
      setSeleccion(nivel); // optimistic update

      try {
        const url = esCambio ? `${API_BASE}/${miRaiting!.id}` : API_BASE;
        const method = esCambio ? 'PUT' : 'POST';
        const body = esCambio
          ? { puntuacion: nivel }
          : { recetaId, puntuacion: nivel };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.mensaje ?? 'Error al guardar valoración.');
        }

        const data = await response.json();
        const raitingActualizado: RaitingDto = esCambio ? data.data : data;
        setMiRaiting(raitingActualizado);

        // Refrescar resumen para promedio en tiempo real
        const resData = await fetchResumen();
        if (resData) {
          setResumen(resData);
          onCambiado?.(resData);
        }
      } catch (e: any) {
        setSeleccion(prevSeleccion); // revertir en caso de error
        throw e; // re-throw para que el componente muestre Alert
      } finally {
        setEnviando(false);
      }
    },
    [token, enviando, seleccion, miRaiting, recetaId, fetchResumen, onCambiado],
  );

  return {
    resumen,
    miRaiting,
    seleccion,
    cargando,
    enviando,
    error,
    seleccionarMedalla,
    recargar,
  };
}
