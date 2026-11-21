import { ANIMAL_LEVELS } from './lesson4/animals';

export const COLORS = [
  'red', 'blue', 'yellow', 'green', 'orange', 'purple',
  'pink', 'brown', 'black', 'white', 'gray', 'cyan',
] as const;
export type ColorName = (typeof COLORS)[number];
export const MAX_GARDEN_LEVEL = 4;
const LEVEL_ONE_COLORS: ColorName[] = ['red', 'blue', 'yellow', 'green'];
const LATER_LEVEL_COLORS: ColorName[] = [
  'blue', 'yellow', 'green', 'orange', 'purple', 'gray',
  'pink', 'brown', 'black', 'white', 'cyan',
];

export type LessonStates = {
  'color-mixing': { level: number; matchedColors: ColorName[] };
  animals: { finishedLevels: boolean[] };
};
export type StatefulLessonId = keyof LessonStates;

export function activeColorsForLevel(level: number): ColorName[] {
  return level === 1 ? LEVEL_ONE_COLORS : LATER_LEVEL_COLORS.slice(0, 4 + (level - 1) * 2);
}

export function isStatefulLessonId(value: unknown): value is StatefulLessonId {
  return value === 'color-mixing' || value === 'animals';
}

export function isValidLessonState<K extends StatefulLessonId>(
  lessonId: K,
  value: unknown,
): value is LessonStates[K] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  if (lessonId === 'animals') {
    return Array.isArray(state.finishedLevels) &&
      state.finishedLevels.length === ANIMAL_LEVELS.length &&
      state.finishedLevels.every((flag: unknown) => typeof flag === 'boolean');
  }
  const { level, matchedColors } = state;
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 ||
      level > MAX_GARDEN_LEVEL || !Array.isArray(matchedColors)) return false;
  const activeColors = activeColorsForLevel(level);
  return matchedColors.every((color: unknown) =>
    typeof color === 'string' && activeColors.some((active) => active === color),
  ) && new Set(matchedColors).size === matchedColors.length;
}

export function isLessonStateComplete(lessonId: StatefulLessonId, state: LessonStates[StatefulLessonId]): boolean {
  if (lessonId === 'animals' && 'finishedLevels' in state) return state.finishedLevels.every(Boolean);
  if (lessonId === 'color-mixing' && 'matchedColors' in state) {
    return state.level === MAX_GARDEN_LEVEL &&
      state.matchedColors.length === activeColorsForLevel(state.level).length;
  }
  return false;
}
