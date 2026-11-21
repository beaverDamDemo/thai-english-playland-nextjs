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
  /** Emoji shown next to the activity name. */
  icon: string;
  /** One short sentence describing what the learner does in the game. */
  description: string;
  status: 'done' | 'change' | 'blank';
  /** Set only for lessons that have a playable game: /zones/<zone-slug>/lesson-<number> */
  href?: string;
};

export type CurriculumZone = {
  id: CurriculumZoneId;
  /** URL segment: /zones/<slug> */
  slug: string;
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
    slug: 'starter',
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
      { id: 'colors', number: 1, title: 'Colors', activity: 'Color quiz', icon: '🎨', description: 'Answer colour questions to bring a grey picture back to life.', status: 'done', href: '/zones/starter/lesson-1' },
      { id: 'color-mixing', number: 2, title: 'Color Mixing', activity: 'Color merge', icon: '🌷', description: 'Match each colour word to its tile and grow a colourful garden.', status: 'done', href: '/zones/starter/lesson-2' },
      { id: 'numbers', number: 3, title: 'Numbers', activity: 'Number game', icon: '🧲', description: 'Pick the right number to stack magnet pieces into a toy.', status: 'done', href: '/zones/starter/lesson-3' },
      { id: 'greetings', number: 4, title: 'Greetings', activity: 'No game', icon: '💬', description: 'Game coming soon.', status: 'blank' },
      { id: 'i-and-you', number: 5, title: 'I / You / I am / You are', activity: 'No game', icon: '🙋', description: 'Game coming soon.', status: 'blank' },
      { id: 'animals', number: 6, title: 'Animals', activity: 'Animal pipes', icon: '🐾', description: 'Rotate pipe pieces to connect each animal to its name.', status: 'done', href: '/zones/starter/lesson-6' },
    ],
  },
  {
    id: 'everyday-vocabulary',
    slug: 'chiang-mai',
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
      { id: 'food', number: 1, title: 'Food', activity: 'Food market', icon: '🛒', description: 'Drag the food you hear from the shelf into your basket.', status: 'done', href: '/zones/chiang-mai/lesson-1' },
      { id: 'clothing', number: 2, title: 'Clothing', activity: 'Dress-up', icon: '👕', description: 'Dress up your buddy with the clothes you are asked for.', status: 'done', href: '/zones/chiang-mai/lesson-2' },
      { id: 'body-parts', number: 3, title: 'Body Parts', activity: 'Body builder', icon: '👾', description: 'Build a funny monster by adding the right body parts.', status: 'done', href: '/zones/chiang-mai/lesson-3' },
      { id: 'family-members', number: 4, title: 'Family Members', activity: 'Quiz', icon: '🧭', description: 'Answer quiz questions to earn moves through a maze.', status: 'change', href: '/zones/chiang-mai/lesson-4' },
      { id: 'descriptive-vocabulary', number: 5, title: 'Descriptive Vocabulary', activity: 'Match-3', icon: '💎', description: 'Swap tiles to make matches, then answer to keep the combo.', status: 'done', href: '/zones/chiang-mai/lesson-5' },
      { id: 'telling-time', number: 6, title: 'Telling Time', activity: 'Time quiz', icon: '⏰', description: 'Answer time questions to earn moves through a maze.', status: 'change', href: '/zones/chiang-mai/lesson-6' },
    ],
  },
  {
    id: 'basic-grammar',
    slug: 'the-golden-baht-casino',
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
      { id: 'be-present', number: 1, title: 'Forms of be (is / am / are)', activity: 'Quiz', icon: '🧭', description: 'Choose is / am / are to earn moves through a maze.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-1' },
      { id: 'be-past', number: 2, title: 'Forms of be (was / were)', activity: 'Quiz', icon: '🧭', description: 'Choose was / were to earn moves through a maze.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-2' },
      { id: 'have-has', number: 3, title: 'Have / Has', activity: 'Poker cards', icon: '🃏', description: 'Answer correctly to draw cards and build a winning poker hand.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-3' },
      { id: 'there-is-there-are', number: 4, title: 'There Is / There Are', activity: 'Roulette', icon: '🎡', description: 'Answer correctly to earn spins on the roulette wheel.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-4' },
      { id: 'demonstratives', number: 5, title: 'This / That / These / Those', activity: 'Slot machine', icon: '🎰', description: 'Answer correctly to spin the slot machine reels.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-5' },
      { id: 'articles', number: 6, title: 'Articles (a / an / the)', activity: 'Article slots', icon: '🎰', description: 'Pick a / an / the to win spins on the article slots.', status: 'done', href: '/zones/the-golden-baht-casino/lesson-6' },
    ],
  },
  {
    id: 'building-sentences',
    slug: 'phuket',
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
      { id: 'present-simple', number: 1, title: 'Present Simple', activity: 'Quiz', icon: '🧭', description: 'Answer present simple questions to move through a maze.', status: 'change', href: '/zones/phuket/lesson-1' },
      { id: 'negative-sentences', number: 2, title: 'Negative Sentences', activity: 'No game', icon: '🚫', description: 'Game coming soon.', status: 'blank' },
      { id: 'questions', number: 3, title: 'Questions (do / does / did)', activity: 'Quiz', icon: '🧭', description: 'Pick do / does / did to earn moves through a maze.', status: 'change', href: '/zones/phuket/lesson-3' },
      { id: 'pronouns', number: 4, title: 'Pronouns (me / my, you / your)', activity: 'Quiz', icon: '🧭', description: 'Choose the right pronoun to move through a maze.', status: 'done', href: '/zones/phuket/lesson-4' },
      { id: 'he-she-his-her', number: 5, title: 'He / She and His / Her', activity: 'Quiz', icon: '🧭', description: 'Choose he / she / his / her to move through a maze.', status: 'done', href: '/zones/phuket/lesson-5' },
      { id: 'place-prepositions', number: 6, title: 'Place Prepositions', activity: 'Quiz', icon: '🧭', description: 'Choose in / on / at to earn moves through a maze.', status: 'done', href: '/zones/phuket/lesson-6' },
    ],
  },
  {
    id: 'verbs-communication',
    slug: 'pattaya',
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
      { id: 'past-tense-verbs', number: 1, title: 'Past-Tense Verbs', activity: 'Naval battle', icon: '🚢', description: 'Answer past-tense questions to fire at enemy ships.', status: 'change', href: '/zones/pattaya/lesson-1' },
      { id: 'irregular-verbs', number: 2, title: 'Irregular Verbs', activity: 'Tank game', icon: '🪖', description: 'Answer correctly to reload, then fire to destroy tanks.', status: 'done', href: '/zones/pattaya/lesson-2' },
      { id: 'future-forms', number: 3, title: 'Future Forms (will / going to)', activity: 'Quiz', icon: '🧭', description: 'Choose will / going to to earn moves through a maze.', status: 'done', href: '/zones/pattaya/lesson-3' },
      { id: 'places-directions', number: 4, title: 'Places and Directions', activity: 'No game', icon: '🗺️', description: 'Game coming soon.', status: 'blank' },
      { id: 'days-months', number: 5, title: 'Days and Months', activity: 'No game', icon: '📅', description: 'Game coming soon.', status: 'blank' },
      { id: 'weather', number: 6, title: 'Weather', activity: 'No game', icon: '🌦️', description: 'Game coming soon.', status: 'blank' },
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

export function getZoneHref(zone: CurriculumZone): string {
  return `/zones/${zone.slug}`;
}

/** URL for any lesson, including blank ones that show the "coming soon" page. */
export function getLessonHref(zone: CurriculumZone, lesson: CurriculumLesson): string {
  return lesson.href ?? `${getZoneHref(zone)}/lesson-${lesson.number}`;
}

export function getZoneBySlug(slug: string): CurriculumZone | undefined {
  return curriculumZones.find((zone) => zone.slug === slug);
}
