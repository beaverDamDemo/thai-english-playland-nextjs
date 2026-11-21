export type PartId = 'eye' | 'ear' | 'nose' | 'mouth' | 'arm' | 'leg';

export type MonsterConfig = {
  eyes: number;
  ears: number;
  arms: number;
  legs: number;
  nose: boolean;
};

export const PART_INFO: Record<
  PartId,
  { singular: string; plural: string; thai: string }
> = {
  eye: { singular: 'eye', plural: 'eyes', thai: 'ตา' },
  ear: { singular: 'ear', plural: 'ears', thai: 'หู' },
  nose: { singular: 'nose', plural: 'noses', thai: 'จมูก' },
  mouth: { singular: 'mouth', plural: 'mouths', thai: 'ปาก' },
  arm: { singular: 'arm', plural: 'arms', thai: 'แขน' },
  leg: { singular: 'leg', plural: 'legs', thai: 'ขา' },
};

export const FULL_MONSTER: MonsterConfig = {
  eyes: 2,
  ears: 2,
  arms: 2,
  legs: 2,
  nose: true,
};

export const COUNT_PARTS = ['eye', 'ear', 'arm', 'leg'] as const;
export type CountPart = (typeof COUNT_PARTS)[number];

export const MAX_COUNT: Record<CountPart, number> = {
  eye: 3,
  ear: 2,
  arm: 4,
  leg: 4,
};

export const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four'];
export const NUMBER_THAI = ['ไม่มี', 'หนึ่ง', 'สอง', 'สาม', 'สี่'];

export function countToConfigKey(part: CountPart): keyof MonsterConfig {
  return `${part}s` as keyof MonsterConfig;
}

export function partPhrase(part: PartId, qty: number): string {
  const info = PART_INFO[part];
  return `${NUMBER_WORDS[qty]} ${qty === 1 ? info.singular : info.plural}`;
}

export function configDescription(
  config: MonsterConfig,
  parts: readonly CountPart[],
): { en: string; th: string } {
  const phrases = parts.map((part) =>
    partPhrase(part, config[countToConfigKey(part)] as number),
  );
  const joined =
    phrases.length < 2
      ? phrases.join('')
      : `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`;
  const thai = parts
    .map((part) => {
      const qty = config[countToConfigKey(part)] as number;
      return `${PART_INFO[part].thai} ${qty}`;
    })
    .join(' ');
  return { en: `This monster has ${joined}.`, th: `มอนสเตอร์มี ${thai}` };
}

export type TouchRound = PartId[];
export const TOUCH_ROUNDS: TouchRound[] = [
  ['nose', 'eye', 'mouth'],
  ['ear', 'arm', 'leg'],
  ['leg', 'nose', 'ear', 'eye'],
];

export const BUILD_ROUNDS: MonsterConfig[] = [
  { eyes: 1, ears: 2, arms: 2, legs: 2, nose: true },
  { eyes: 2, ears: 1, arms: 3, legs: 2, nose: true },
  { eyes: 3, ears: 2, arms: 4, legs: 4, nose: true },
];

export type PickRound = {
  mentioned: CountPart[];
  options: MonsterConfig[];
  answer: number;
};

const BASE = { ears: 2, nose: true };

export const PICK_ROUNDS: PickRound[] = [
  {
    mentioned: ['eye', 'arm'],
    options: [
      { ...BASE, eyes: 1, arms: 2, legs: 2 },
      { ...BASE, eyes: 3, arms: 2, legs: 2 },
      { ...BASE, eyes: 1, arms: 4, legs: 2 },
    ],
    answer: 2,
  },
  {
    mentioned: ['eye', 'arm', 'leg'],
    options: [
      { ...BASE, eyes: 2, arms: 3, legs: 4 },
      { ...BASE, eyes: 2, arms: 3, legs: 2 },
      { ...BASE, eyes: 3, arms: 3, legs: 4 },
    ],
    answer: 1,
  },
  {
    mentioned: ['eye', 'arm', 'leg'],
    options: [
      { ...BASE, eyes: 3, arms: 1, legs: 3 },
      { ...BASE, eyes: 3, arms: 2, legs: 3 },
      { ...BASE, eyes: 1, arms: 2, legs: 3 },
    ],
    answer: 1,
  },
];

export const LEVELS = [
  { title: 'Touch', rounds: TOUCH_ROUNDS.length },
  { title: 'Build', rounds: BUILD_ROUNDS.length },
  { title: 'Match', rounds: PICK_ROUNDS.length },
] as const;
