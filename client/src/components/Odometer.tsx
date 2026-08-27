import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface OdometerProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Rolls up to its target value once it enters view — the site's signature move. */
export function Odometer({ value, format = (n) => Math.round(n).toString(), duration = 1.4, className }: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px 0px 0px' });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reducedMotion, duration]);

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className ?? ''}`}>
      {format(display)}
    </span>
  );
}
