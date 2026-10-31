import type { ClothingKind } from './clothes';

const OUTLINE = '#3f4448';

const SHAPES: Record<ClothingKind, string[]> = {
  hat: [
    'M20 62 Q20 26 50 26 Q80 26 80 62 Z',
    'M14 60 H86 Q92 60 92 67 Q92 74 86 74 H14 Q8 74 8 67 Q8 60 14 60 Z',
  ],
  shirt: [
    'M32 18 L10 34 L22 52 L32 45 V84 H68 V45 L78 52 L90 34 L68 18 Q50 30 32 18 Z',
  ],
  pants: ['M26 14 H74 L78 88 H55 L50 40 L45 88 H22 Z'],
  shoes: [
    'M8 58 L20 54 L28 62 Q46 64 46 80 H8 Z',
    'M92 58 L80 54 L72 62 Q54 64 54 80 H92 Z',
  ],
};

export default function ClothingIcon({
  kind,
  color,
  className,
}: {
  kind: ClothingKind;
  color: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {SHAPES[kind].map((path) => (
        <path
          key={path}
          d={path}
          fill={color}
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
      {kind === 'hat' && (
        <circle cx="50" cy="24" r="7" fill={color} stroke={OUTLINE} strokeWidth="3" />
      )}
    </svg>
  );
}
