import type { FooterTheme } from '@/app/_components/GameFooter';

export type CurriculumZoneId =
  | 'starter'
  | 'everyday-vocabulary'
  | 'basic-grammar'
  | 'building-sentences'
  | 'verbs-communication';

export const zoneThemeGames: Record<CurriculumZoneId, FooterTheme> = {
  starter: 'starter',
  'everyday-vocabulary': 'maze',
  'basic-grammar': 'casino',
  'building-sentences': 'pattaya',
  'verbs-communication': 'pattaya-zone',
};

export type CurriculumLesson = {
  id: string;
  number: number;
  title: string;
  activity: string;
  status: 'done' | 'change' | 'blank';
  href?: string;
};

export type CurriculumZone = {
  id: CurriculumZoneId;
  order: number;
  title: string;
  icon: string;
  description: string;
  lessons: CurriculumLesson[];
  mapPoints: Array<{ left: number; top: number; color: string }>;
};

export const curriculumZones: CurriculumZone[] = [
  {
    id: 'starter',
    order: 1,
    title: 'Starter',
    icon: '🌱',
    description: 'The easiest lessons for new learners.',
    mapPoints: [
      { left: 50, top: 82, color: '#173e78' },
      { left: 22, top: 67, color: '#F3C928' },
      { left: 72, top: 53, color: '#1FA8C9' },
      { left: 28, top: 38, color: '#6F8FA3' },
      { left: 68, top: 23, color: '#9B6BD1' },
      { left: 55, top: 5, color: '#F28C28' },
    ],
    lessons: [
      { id: 'colors', number: 1, title: 'Colors', activity: 'Color quiz', status: 'done', href: '/games/starter/lesson1' },
      { id: 'color-mixing', number: 2, title: 'Color Mixing', activity: 'Color merge', status: 'done', href: '/games/starter/lesson2' },
      { id: 'numbers', number: 3, title: 'Numbers', activity: 'Number game', status: 'done', href: '/games/starter/lesson3' },
      { id: 'greetings', number: 4, title: 'Greetings', activity: 'No game', status: 'blank' },
      { id: 'i-and-you', number: 5, title: 'I / You / I am / You are', activity: 'No game', status: 'blank' },
      { id: 'animals', number: 6, title: 'Animals', activity: 'Animal pipes', status: 'done', href: '/games/starter/lesson4' },
    ],
  },
  {
    id: 'everyday-vocabulary',
    order: 2,
    title: 'Chiang Mai',
    icon: '🐘',
    description: 'Useful words for everyday life.',
    mapPoints: [
      { left: 50, top: 82, color: '#4CAF50' },
      { left: 22, top: 67, color: '#E91E63' },
      { left: 72, top: 53, color: '#3F51B5' },
      { left: 28, top: 38, color: '#F44336' },
      { left: 68, top: 23, color: '#FF9800' },
      { left: 55, top: 5, color: '#795548' },
    ],
    lessons: [
      { id: 'food', number: 1, title: 'Food', activity: 'Food market', status: 'done', href: '/games/starter/lesson6' },
      { id: 'clothing', number: 2, title: 'Clothing', activity: 'Dress-up', status: 'done', href: '/games/starter/lesson5' },
      { id: 'body-parts', number: 3, title: 'Body Parts', activity: 'Body builder', status: 'done', href: '/games/starter/lesson7' },
      { id: 'family-members', number: 4, title: 'Family Members', activity: 'Quiz maze', status: 'change', href: '/games/maze/lesson2' },
      { id: 'descriptive-vocabulary', number: 5, title: 'Descriptive Vocabulary', activity: 'Match-3', status: 'done', href: '/games/pattaya-games/lesson2' },
      { id: 'telling-time', number: 6, title: 'Telling Time', activity: 'Time quiz', status: 'change', href: '/games/maze/lesson1' },
    ],
  },
  {
    id: 'basic-grammar',
    order: 3,
    title: 'The Golden Baht Casino',
    icon: '🎰',
    description: 'Build a foundation in essential grammar.',
    mapPoints: [
      { left: 50, top: 82, color: '#2196F3' },
      { left: 22, top: 67, color: '#009688' },
      { left: 72, top: 53, color: '#15803D' },
      { left: 28, top: 38, color: '#B91C1C' },
      { left: 68, top: 23, color: '#1D3557' },
      { left: 55, top: 5, color: '#9C27B0' },
    ],
    lessons: [
      { id: 'be-present', number: 1, title: 'Forms of be (is / am / are)', activity: 'Maze quiz', status: 'done', href: '/games/basic-grammar/lesson1' },
      { id: 'be-past', number: 2, title: 'Forms of be (was / were)', activity: 'Maze quiz', status: 'done', href: '/games/basic-grammar/lesson2' },
      { id: 'have-has', number: 3, title: 'Have / Has', activity: 'Poker cards', status: 'done', href: '/games/casino/lesson1' },
      { id: 'there-is-there-are', number: 4, title: 'There Is / There Are', activity: 'Roulette', status: 'done', href: '/games/casino/lesson2' },
      { id: 'demonstratives', number: 5, title: 'This / That / These / Those', activity: 'Slot machine', status: 'done', href: '/games/casino/lesson3' },
      { id: 'articles', number: 6, title: 'Articles (a / an / the)', activity: 'Article slots', status: 'done', href: '/games/casino/lesson4' },
    ],
  },
  {
    id: 'building-sentences',
    order: 4,
    title: 'Phuket',
    icon: '🏝️',
    description: 'Practice putting English sentences together.',
    mapPoints: [
      { left: 50, top: 82, color: '#795548' },
      { left: 22, top: 67, color: '#607D8B' },
      { left: 72, top: 53, color: '#9C27B0' },
      { left: 28, top: 38, color: '#009688' },
      { left: 68, top: 23, color: '#E91E63' },
      { left: 55, top: 5, color: '#3F51B5' },
    ],
    lessons: [
      { id: 'present-simple', number: 1, title: 'Present Simple', activity: 'Quiz maze', status: 'change', href: '/games/maze/lesson9' },
      { id: 'negative-sentences', number: 2, title: 'Negative Sentences', activity: 'No game', status: 'blank' },
      { id: 'questions', number: 3, title: 'Questions (do / does / did)', activity: 'Quiz maze', status: 'change', href: '/games/maze/lesson5' },
      { id: 'pronouns', number: 4, title: 'Pronouns (me / my, you / your)', activity: 'Quiz maze', status: 'done', href: '/games/maze/lesson6' },
      { id: 'he-she-his-her', number: 5, title: 'He / She and His / Her', activity: 'Quiz maze', status: 'done', href: '/games/maze/lesson7' },
      { id: 'place-prepositions', number: 6, title: 'Place Prepositions', activity: 'Quiz maze', status: 'done', href: '/games/maze/lesson8' },
    ],
  },
  {
    id: 'verbs-communication',
    order: 5,
    title: 'Pattaya',
    icon: '🌊',
    description: 'Talk about actions, places, dates, and weather.',
    mapPoints: [
      { left: 50, top: 82, color: '#173771' },
      { left: 22, top: 67, color: '#305B0F' },
      { left: 72, top: 53, color: '#FF9800' },
      { left: 28, top: 38, color: '#5E60CE' },
      { left: 68, top: 23, color: '#F06595' },
      { left: 55, top: 5, color: '#2EC4B6' },
    ],
    lessons: [
      { id: 'past-tense-verbs', number: 1, title: 'Past-Tense Verbs', activity: 'Naval battle', status: 'change', href: '/games/pattaya-games/lesson3' },
      { id: 'irregular-verbs', number: 2, title: 'Irregular Verbs', activity: 'Tank game', status: 'done', href: '/games/pattaya-games/lesson1' },
      { id: 'future-forms', number: 3, title: 'Future Forms (will / going to)', activity: 'Quiz maze', status: 'done', href: '/games/verbs-communication/lesson3' },
      { id: 'places-directions', number: 4, title: 'Places and Directions', activity: 'No game', status: 'blank' },
      { id: 'days-months', number: 5, title: 'Days and Months', activity: 'No game', status: 'blank' },
      { id: 'weather', number: 6, title: 'Weather', activity: 'No game', status: 'blank' },
    ],
  },
];

export function getCurriculumZone(
  zoneId: string,
): CurriculumZone | undefined {
  return curriculumZones.find((zone) => zone.id === zoneId);
}

export function getLessonByHref(href: string): CurriculumLesson | undefined {
  return curriculumZones.flatMap((zone) => zone.lessons).find((lesson) => lesson.href === href);
}
