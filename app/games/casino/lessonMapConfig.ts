export type LessonMapButton = {
  num: number;
  color: string;
  left: number;
  top: number;
};

export const casinoLessonThemes = {
  1: { color: '#15803D', dark: '#14532D' },
  2: { color: '#B91C1C', dark: '#7F1D1D' },
  3: { color: '#1D3557', dark: '#13253E' },
  4: { color: '#9C27B0', dark: '#7B1FA2' },
  5: { color: '#C77800', dark: '#783D08' },
} as const;

export const lessonMapButtons: LessonMapButton[] = [
  { num: 1, color: casinoLessonThemes[1].color, left: 57, top: 77.0 },
  { num: 2, color: casinoLessonThemes[2].color, left: 35.4, top: 58.6 },
  { num: 3, color: casinoLessonThemes[3].color, left: 47.7, top: 46.7 },
  { num: 4, color: casinoLessonThemes[4].color, left: 30.2, top: 34.6 },
  { num: 5, color: casinoLessonThemes[5].color, left: 37.5, top: 22.9 },
];