"use client";
import { useEffect, useState } from "react";

// Detecta qué fotos oficiales de la HCDN no cargan (id cambiado, host caído puntual) para
// caer a las iniciales en vez de dejar un disco de color vacío. Precarga diferida en idle,
// una sola vez, con concurrencia limitada. Mostrar iniciales ante un fallo siempre es
// mejor o igual que el disco vacío actual, así que no hace falta ningún umbral.
export function useFailedPhotos(urls: string[]): Set<string> {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !urls.length) return;
    let cancelled = false;
    const unique = [...new Set(urls)];
    let i = 0;
    const CONCURRENCY = 6;
    const bad: string[] = [];

    const loadNext = () => {
      if (cancelled) return;
      if (i >= unique.length) {
        if (bad.length) setFailed((prev) => new Set([...prev, ...bad]));
        return;
      }
      const url = unique[i++];
      const img = new Image();
      img.onload = loadNext;
      img.onerror = () => {
        bad.push(url);
        loadNext();
      };
      img.src = url;
    };

    const start = () => {
      for (let c = 0; c < CONCURRENCY; c++) loadNext();
    };
    // Diferido: no compite con el primer render ni con las imágenes ya visibles.
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const handle = ric ? ric(start) : window.setTimeout(start, 1200);
    return () => {
      cancelled = true;
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (ric && cic) cic(handle as number);
      else clearTimeout(handle as number);
    };
  }, [urls]);

  return failed;
}
