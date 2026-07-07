"use client";
import { useEffect, useRef, useState } from "react";

// Número animado — equivalente del CU del prototipo (ease-out cúbico, 750ms inicial, 420ms en updates).
export default function CountUp({ to, dur = 750 }: { to: number; dur?: number }) {
  const [v, setV] = useState(0);
  const raf = useRef(0);
  const cur = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    const from = mounted.current ? cur.current : 0;
    const d = mounted.current ? 420 : dur;
    mounted.current = true;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / d);
      const e2 = 1 - Math.pow(1 - k, 3);
      const val = from + (to - from) * e2;
      cur.current = val;
      setV(val);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  return <>{String(Math.round(v))}</>;
}
