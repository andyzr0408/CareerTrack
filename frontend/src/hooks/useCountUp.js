import { useEffect, useState } from 'react';

/** Sube de 0 al valor final en ~700 ms. Si el usuario pidió menos movimiento, muestra el valor directo. */
export default function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!Number.isFinite(end) || reduce) {
      setValue(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(end * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
