"use client";
import { useCallback, useSyncExternalStore } from "react";

// Media query como estado de React sin riesgo de hydration mismatch: el snapshot de
// servidor devuelve false (el prerender asume puntero fino / desktop) y el primer render
// del cliente coincide; el valor real llega en el re-render posterior a la hidratación.
// Regla de uso: el resultado solo puede condicionar handlers de eventos o UI que aparece
// después de una interacción — nunca la estructura del DOM inicial (eso se hace con CSS).
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
