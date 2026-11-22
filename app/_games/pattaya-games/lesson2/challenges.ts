// English content for the Descriptive Vocabulary lesson (also read by the Lesson Content page).
import type { Challenge } from './Quiz';

export const practiceChallenges: Challenge[] = [
  {
    prompt: 'Ice cream is usually _______.',
    options: ['hot', 'cold', 'high', 'cheap'],
    answer: 1,
  },
  {
    prompt: 'A mountain is very _______.',
    options: ['low', 'high', 'cool down', 'warm up'],
    answer: 1,
  },
  {
    prompt: 'Tea can be very _______ right after you make it.',
    options: ['cold', 'cheap', 'hot', 'low'],
    answer: 2,
  },
  {
    prompt: 'If the room is too warm, open the window to _______.',
    options: ['warm up', 'cool down', 'go high', 'get expensive'],
    answer: 1,
  },
  {
    prompt: 'This T-shirt is only 100 baht. It is _______.',
    options: ['expensive', 'high', 'cheap', 'cold'],
    answer: 2,
  },
];

export const applyChallenges: Challenge[] = [
  {
    prompt: 'After running, I need some water to _______.',
    options: ['cool down', 'warm up', 'stay high', 'be expensive'],
    answer: 0,
  },
  {
    prompt: 'In the morning, I stretch first to _______ my body.',
    options: ['cool down', 'warm up', 'make low', 'make cheap'],
    answer: 1,
  },
  {
    prompt: 'The phone costs 30,000 baht. It is _______.',
    options: ['cheap', 'cold', 'expensive', 'low'],
    answer: 2,
  },
  {
    prompt: 'The airplane is flying very _______ in the sky.',
    options: ['cheap', 'high', 'cold', 'cool'],
    answer: 1,
  },
  {
    prompt: 'At night on the beach, the wind feels _______.',
    options: ['hot', 'expensive', 'cold', 'high'],
    answer: 2,
  },
];

export const QUESTIONS: Challenge[] = [...practiceChallenges, ...applyChallenges];
