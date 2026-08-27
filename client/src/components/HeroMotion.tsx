import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const HILL_PATH =
  'M0,120 L0,70 C60,40 140,85 220,55 C300,25 380,70 460,45 C540,20 620,65 700,40 C780,15 860,60 940,35 C980,22 1000,30 1000,30 L1000,120 Z';

const PEAK_FILL =
  'M0,160 L0,92 L38,58 L72,84 L108,34 L146,68 L182,48 L222,8 L258,54 L296,38 L336,74 L376,44 L414,64 L452,28 L492,58 L532,18 L572,62 L610,40 L650,72 L688,46 L728,80 L766,54 L806,90 L844,58 L884,94 L922,68 L958,88 L1000,74 L1000,160 Z';

const PEAK_RIDGE =
  'M0,92 L38,58 L72,84 L108,34 L146,68 L182,48 L222,8 L258,54 L296,38 L336,74 L376,44 L414,64 L452,28 L492,58 L532,18 L572,62 L610,40 L650,72 L688,46 L728,80 L766,54 L806,90 L844,58 L884,94 L922,68 L958,88 L1000,74';

function HazeLayer({ still }: { still: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="flex h-full w-[200%]"
        animate={still ? undefined : { x: ['0%', '-50%'] }}
        transition={still ? undefined : { duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((i) => (
          <div key={i} className="relative h-full w-1/2">
            <div className="absolute left-[10%] top-[12%] h-40 w-96 rounded-full bg-cream/[0.04] blur-3xl" />
            <div className="absolute left-[55%] top-[30%] h-56 w-[32rem] rounded-full bg-cream/[0.03] blur-3xl" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Distant Himalaya-style ridgeline, drifting slower than the foreground hills for parallax depth. */
function PeakLayer({ still }: { still: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-[26%] h-[38%] overflow-hidden">
      <motion.div
        className="flex h-full w-[200%]"
        animate={still ? undefined : { x: ['0%', '-50%'] }}
        transition={still ? undefined : { duration: 70, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1000 160" preserveAspectRatio="none" className="h-full w-1/2">
            <path d={PEAK_FILL} fill="#0A1B12" opacity={0.45} />
            <path d={PEAK_RIDGE} fill="none" stroke="#FDF8E3" strokeOpacity={0.12} strokeWidth={1.5} />
          </svg>
        ))}
      </motion.div>
    </div>
  );
}

function HillLayer({ still }: { still: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-[18%] h-[32%] overflow-hidden">
      <motion.div
        className="flex h-full w-[200%]"
        animate={still ? undefined : { x: ['0%', '-50%'] }}
        transition={still ? undefined : { duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1000 120" preserveAspectRatio="none" className="h-full w-1/2">
            <path d={HILL_PATH} fill="#0A1B12" opacity={0.7} />
          </svg>
        ))}
      </motion.div>
    </div>
  );
}

function RoadLine({ still }: { still: boolean }) {
  return (
    <div className="absolute inset-x-0 top-[68%]">
      <svg viewBox="0 0 1000 4" width="100%" height="4" preserveAspectRatio="none">
        <motion.line
          x1="0"
          y1="2"
          x2="1000"
          y2="2"
          stroke="#FDF8E3"
          strokeOpacity="0.3"
          strokeWidth="3"
          strokeDasharray="40 34"
          animate={still ? undefined : { strokeDashoffset: [0, -74] }}
          transition={still ? undefined : { duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}

/** A quiet typographic detail standing in for the old car icon — real coordinates, not an illustration. */
function CoordinateMarker() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[68%] mx-auto max-w-7xl -translate-y-[260%] px-6 md:px-10">
      <p className="text-right font-mono text-[10px] tracking-[0.15em] text-cream/25 md:text-xs">
        27.7172&deg; N &middot; 85.3240&deg; E
      </p>
    </div>
  );
}

function HeadlightSweep() {
  return (
    <motion.div
      className="pointer-events-none absolute top-1/4 h-72 w-72 -ml-36 rounded-full bg-cream/25 blur-3xl"
      initial={{ left: '-10%', opacity: 0 }}
      animate={{ left: '110%', opacity: [0, 0.5, 0.5, 0] }}
      transition={{
        left: { duration: 9, repeat: Infinity, ease: 'linear' },
        opacity: { duration: 9, repeat: Infinity, ease: 'linear', times: [0, 0.15, 0.85, 1] },
      }}
    />
  );
}

/** The layered, animated hero background. Freezes entirely under prefers-reduced-motion. */
export function HeroMotion() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-forest to-forest-deep">
      <HazeLayer still={reducedMotion} />
      <PeakLayer still={reducedMotion} />
      <HillLayer still={reducedMotion} />
      <RoadLine still={reducedMotion} />
      <CoordinateMarker />
      {!reducedMotion && <HeadlightSweep />}
    </div>
  );
}
