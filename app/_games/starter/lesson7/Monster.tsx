import type { MonsterConfig, PartId } from './body';

const LINE = '#3f4448';
const SKIN = '#8fd3a1';

const EYE_X: Record<number, number[]> = {
  0: [],
  1: [100],
  2: [78, 122],
  3: [62, 100, 138],
};

const LEG_X: Record<number, number[]> = {
  0: [],
  1: [100],
  2: [80, 120],
  3: [66, 100, 134],
  4: [60, 86, 114, 140],
};

const ARM_SLOTS = [
  { x1: 52, y1: 140, x2: 20, y2: 150 },
  { x1: 148, y1: 140, x2: 180, y2: 150 },
  { x1: 50, y1: 168, x2: 18, y2: 188 },
  { x1: 150, y1: 168, x2: 182, y2: 188 },
];

export default function Monster({
  config,
  onPartClick,
  className,
}: {
  config: MonsterConfig;
  onPartClick?: (part: PartId) => void;
  className?: string;
}) {
  const interactive = Boolean(onPartClick);

  function part(id: PartId, key: string, children: React.ReactNode) {
    if (!interactive) return <g key={key}>{children}</g>;
    return (
      <g
        key={key}
        role="button"
        tabIndex={0}
        aria-label={id}
        style={{ cursor: 'pointer' }}
        onClick={() => onPartClick?.(id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onPartClick?.(id);
          }
        }}
      >
        {children}
      </g>
    );
  }

  const arms = ARM_SLOTS.slice(0, config.arms);

  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      aria-hidden={interactive ? undefined : true}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Monster' : undefined}
    >
      {LEG_X[config.legs].map((x) =>
        part(
          'leg',
          `leg-${x}`,
          <>
            <rect x={x - 9} y={188} width={18} height={38} rx={8} fill={SKIN} stroke={LINE} strokeWidth={3} />
            <ellipse cx={x} cy={228} rx={14} ry={7} fill={SKIN} stroke={LINE} strokeWidth={3} />
          </>,
        ),
      )}
      {arms.map((arm) =>
        part(
          'arm',
          `arm-${arm.x1}-${arm.y1}`,
          <>
            <line x1={arm.x1} y1={arm.y1} x2={arm.x2} y2={arm.y2} stroke={LINE} strokeWidth={16} strokeLinecap="round" />
            <line x1={arm.x1} y1={arm.y1} x2={arm.x2} y2={arm.y2} stroke={SKIN} strokeWidth={10} strokeLinecap="round" />
          </>,
        ),
      )}
      {[45, 155].slice(0, config.ears).map((x) =>
        part(
          'ear',
          `ear-${x}`,
          <circle cx={x} cy={62} r={16} fill={SKIN} stroke={LINE} strokeWidth={3} />,
        ),
      )}
      <ellipse cx={100} cy={128} rx={58} ry={66} fill={SKIN} stroke={LINE} strokeWidth={3} />
      {EYE_X[config.eyes].map((x) =>
        part(
          'eye',
          `eye-${x}`,
          <>
            <circle cx={x} cy={92} r={13} fill="#fff" stroke={LINE} strokeWidth={3} />
            <circle cx={x} cy={94} r={5} fill={LINE} />
          </>,
        ),
      )}
      {config.nose &&
        part(
          'nose',
          'nose',
          <path d="M100 108 L90 130 H110 Z" fill="#6bb882" stroke={LINE} strokeWidth={3} strokeLinejoin="round" />,
        )}
      {part(
        'mouth',
        'mouth',
        <path
          d="M76 150 Q100 176 124 150 Q100 158 76 150 Z"
          fill="#c2453f"
          stroke={LINE}
          strokeWidth={3}
          strokeLinejoin="round"
        />,
      )}
    </svg>
  );
}
