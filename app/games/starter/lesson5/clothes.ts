export const CLOTHING_KINDS = ['hat', 'shirt', 'pants', 'shoes'] as const;
export type ClothingKind = (typeof CLOTHING_KINDS)[number];

export const CLOTHING_COLORS = ['red', 'blue', 'yellow', 'green'] as const;
export type ClothingColor = (typeof CLOTHING_COLORS)[number];

export const KIND_THAI: Record<ClothingKind, string> = {
  hat: 'หมวก',
  shirt: 'เสื้อ',
  pants: 'กางเกง',
  shoes: 'รองเท้า',
};

export const COLOR_INFO: Record<ClothingColor, { thai: string; hex: string }> =
  {
    red: { thai: 'แดง', hex: '#e0443e' },
    blue: { thai: 'น้ำเงิน', hex: '#2f7fd1' },
    yellow: { thai: 'เหลือง', hex: '#f4c21f' },
    green: { thai: 'เขียว', hex: '#3fa457' },
  };

export type ClothingTarget = { kind: ClothingKind; color: ClothingColor };

export const DRESS_UP_ROUNDS: ClothingTarget[][] = [
  [
    { kind: 'hat', color: 'red' },
    { kind: 'shoes', color: 'blue' },
  ],
  [
    { kind: 'hat', color: 'green' },
    { kind: 'shirt', color: 'yellow' },
    { kind: 'pants', color: 'blue' },
  ],
  [
    { kind: 'hat', color: 'red' },
    { kind: 'shirt', color: 'blue' },
    { kind: 'pants', color: 'yellow' },
    { kind: 'shoes', color: 'green' },
  ],
];

export function clothingId(kind: ClothingKind, color: ClothingColor): string {
  return `${kind}-${color}`;
}

export function parseClothingId(id: string): ClothingTarget {
  const [kind, color] = id.split('-');
  return { kind: kind as ClothingKind, color: color as ClothingColor };
}

export type SuitcaseItem = {
  id: string;
  name: string;
  thai: string;
  emoji: string;
};

export const SUITCASE_ITEMS: Record<string, SuitcaseItem> = {
  coat: { id: 'coat', name: 'coat', thai: 'เสื้อโค้ท', emoji: '🧥' },
  scarf: { id: 'scarf', name: 'scarf', thai: 'ผ้าพันคอ', emoji: '🧣' },
  gloves: { id: 'gloves', name: 'gloves', thai: 'ถุงมือ', emoji: '🧤' },
  swimsuit: {
    id: 'swimsuit',
    name: 'swimsuit',
    thai: 'ชุดว่ายน้ำ',
    emoji: '🩱',
  },
  sandals: { id: 'sandals', name: 'sandals', thai: 'รองเท้าแตะ', emoji: '🩴' },
  sunglasses: {
    id: 'sunglasses',
    name: 'sunglasses',
    thai: 'แว่นกันแดด',
    emoji: '🕶️',
  },
  shorts: { id: 'shorts', name: 'shorts', thai: 'กางเกงขาสั้น', emoji: '🩳' },
  tshirt: { id: 'tshirt', name: 't-shirt', thai: 'เสื้อยืด', emoji: '👕' },
  umbrella: { id: 'umbrella', name: 'umbrella', thai: 'ร่ม', emoji: '☂️' },
  boots: { id: 'boots', name: 'boots', thai: 'รองเท้าบู๊ต', emoji: '🥾' },
};

export type SuitcaseRound = {
  prompt: string;
  thai: string;
  correct: string[];
  distractors: string[];
};

export const SUITCASE_ROUNDS: SuitcaseRound[] = [
  {
    prompt: 'It is cold. Pack 3 things to keep warm.',
    thai: 'อากาศหนาว เก็บของ 3 อย่างให้อบอุ่น',
    correct: ['coat', 'scarf', 'gloves'],
    distractors: ['swimsuit', 'sandals', 'sunglasses', 'shorts', 'tshirt'],
  },
  {
    prompt: 'It is hot and sunny. Pack 3 things for the beach.',
    thai: 'อากาศร้อนและแดดจัด เก็บของ 3 อย่างไปทะเล',
    correct: ['swimsuit', 'sandals', 'sunglasses'],
    distractors: ['coat', 'scarf', 'gloves', 'boots', 'umbrella'],
  },
  {
    prompt: 'It is raining. Pack 3 things to stay dry.',
    thai: 'ฝนตก เก็บของ 3 อย่างให้ไม่เปียก',
    correct: ['umbrella', 'boots', 'coat'],
    distractors: ['swimsuit', 'sandals', 'sunglasses', 'shorts', 'tshirt'],
  },
];

export const LEVELS = [
  { title: 'Dress Up', rounds: DRESS_UP_ROUNDS.length },
  { title: 'Suitcase', rounds: SUITCASE_ROUNDS.length },
] as const;

// Small deterministic shuffle so tray order is stable per round.
export function shuffled<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;
  for (let index = result.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = Math.floor((state / 0x100000000) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
