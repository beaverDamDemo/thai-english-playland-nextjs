// The English taught in each lesson, read straight from the lesson's own data,
// so the Lesson Content page always matches what the games really ask.
// When you add a lesson, add one entry here (lesson id -> its content).

import { questions as tellingTime } from './maze/lesson1/Quiz';
import { questions as familyMembers } from './maze/lesson2/Quiz';
import { questions as questionWords } from './maze/lesson5/Quiz';
import { questions as pronouns } from './maze/lesson6/Quiz';
import { questions as heSheHisHer } from './maze/lesson7/Quiz';
import { questions as placePrepositions } from './maze/lesson8/Quiz';
import { questions as presentSimple } from './maze/lesson9/Quiz';
import { questions as haveHas } from './casino/lesson1/Quiz';
import { questions as thereIsThereAre } from './casino/lesson2/Quiz';
import { questions as demonstratives } from './casino/lesson3/Quiz';
import { questions as articles } from './casino/lesson4/Quiz';
import { questions as futureForms } from './verbs-communication/lesson3/Quiz';
import { pastBeQuestions, presentBeQuestions } from './basic-grammar/beQuestions';
import { ALL_QUESTIONS as colorQuestions } from './starter/lesson1/colorQuestions';
import { QUESTIONS as descriptiveChallenges } from './pattaya-games/lesson2/challenges';
import { QUESTIONS as pastTenseQuestions } from './pattaya-games/lesson3/questions';
import { VERBS } from './pattaya-games/lesson1/verbs';
import { STAGES } from './starter/lesson3/stages';
import { ANIMAL_LEVELS } from './starter/lesson4/animals';
import { FOODS } from './starter/lesson6/market';
import { CLOTHING_COLORS, CLOTHING_KINDS, COLOR_INFO, KIND_THAI, SUITCASE_ITEMS } from './starter/lesson5/clothes';
import { PART_INFO } from './starter/lesson7/body';
import { COLORS } from './starter/lessonState';

export type TopicType = 'grammar' | 'vocabulary';

export type ContentQuestion = {
  question: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  thai?: string;
};

export type ContentWord = {
  en: string;
  th?: string;
  emoji?: string;
  /** Small extra detail, e.g. plural form or the number itself. */
  note?: string;
};

export type LessonContent = {
  topicType: TopicType;
  /** The language point in a few words, e.g. "have / has". */
  focus: string;
  questions?: ContentQuestion[];
  words?: ContentWord[];
  /** Where the content lives in the code, relative to app/_games. */
  sources: string[];
};

type QuizLike = { q: string; options: string[]; answer: number; thai?: string };
const fromQuiz = (items: QuizLike[]): ContentQuestion[] =>
  items.map(({ q, options, answer, thai }) => ({ question: q, options, answer, thai }));

const uniqueBy = <T,>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const animalRounds = ANIMAL_LEVELS.flatMap((level) => level.rounds);

export const LESSON_CONTENT: Record<string, LessonContent> = {
  // 🌱 Starter
  colors: {
    topicType: 'vocabulary',
    focus: 'colour words',
    questions: fromQuiz(colorQuestions),
    sources: ['starter/lesson1/colorQuestions.ts'],
  },
  'color-mixing': {
    topicType: 'vocabulary',
    focus: 'colour words',
    words: COLORS.map((color) => ({ en: color })),
    sources: ['starter/lessonState.ts (COLORS)'],
  },
  numbers: {
    topicType: 'vocabulary',
    focus: 'numbers 1–1000',
    words: uniqueBy(
      STAGES.flatMap((stage) => stage.numbers),
      (entry) => String(entry.value),
    ).map((entry) => ({ en: entry.en, th: entry.th, note: String(entry.value) })),
    sources: ['starter/lesson3/stages.tsx'],
  },
  greetings: { topicType: 'vocabulary', focus: 'hello, goodbye, good morning…', sources: [] },
  'i-and-you': { topicType: 'grammar', focus: 'I / you, I am / you are', sources: [] },
  animals: {
    topicType: 'vocabulary',
    focus: 'animals and what they eat',
    words: [
      ...uniqueBy(animalRounds, (round) => round.animal).map((round) => ({
        en: round.animal,
        th: round.animalTh,
        emoji: round.animalEmoji,
        note: 'animal',
      })),
      ...uniqueBy(animalRounds, (round) => round.food).map((round) => ({
        en: round.food,
        th: round.foodTh,
        emoji: round.foodEmoji,
        note: 'food',
      })),
    ],
    sources: ['starter/lesson4/animals.ts'],
  },

  // 🐘 Chiang Mai
  food: {
    topicType: 'vocabulary',
    focus: 'food words with a / an / some',
    words: Object.values(FOODS).map((food) => ({
      en: food.name,
      th: food.thai,
      emoji: food.emoji,
      note: `${food.article} ${food.name} · ${food.plural}`,
    })),
    sources: ['starter/lesson6/market.ts'],
  },
  clothing: {
    topicType: 'vocabulary',
    focus: 'clothes + colours',
    words: [
      ...CLOTHING_KINDS.map((kind) => ({ en: kind, th: KIND_THAI[kind], note: 'clothes' })),
      ...CLOTHING_COLORS.map((color) => ({ en: color, th: COLOR_INFO[color].thai, note: 'colour' })),
      ...Object.values(SUITCASE_ITEMS).map((item) => ({ en: item.name, th: item.thai, emoji: item.emoji, note: 'suitcase' })),
    ],
    sources: ['starter/lesson5/clothes.ts'],
  },
  'body-parts': {
    topicType: 'vocabulary',
    focus: 'body parts, singular / plural',
    words: Object.values(PART_INFO).map((part) => ({ en: part.singular, th: part.thai, note: `plural: ${part.plural}` })),
    sources: ['starter/lesson7/body.ts'],
  },
  'family-members': {
    topicType: 'vocabulary',
    focus: 'family words',
    questions: fromQuiz(familyMembers),
    sources: ['maze/lesson2/Quiz.tsx'],
  },
  'descriptive-vocabulary': {
    topicType: 'vocabulary',
    focus: 'adjectives (hot, cold, cheap…)',
    questions: descriptiveChallenges.map(({ prompt, options, answer }) => ({ question: prompt, options, answer })),
    sources: ['pattaya-games/lesson2/challenges.ts'],
  },
  'telling-time': {
    topicType: 'vocabulary',
    focus: 'AM / PM, 24-hour time, parts of the day',
    questions: fromQuiz(tellingTime),
    sources: ['maze/lesson1/Quiz.tsx'],
  },

  // 🎰 The Golden Baht Casino
  'be-present': {
    topicType: 'grammar',
    focus: 'is / am / are',
    questions: fromQuiz(presentBeQuestions),
    sources: ['basic-grammar/beQuestions.ts'],
  },
  'be-past': {
    topicType: 'grammar',
    focus: 'was / were',
    questions: fromQuiz(pastBeQuestions),
    sources: ['basic-grammar/beQuestions.ts'],
  },
  'have-has': { topicType: 'grammar', focus: 'have / has', questions: fromQuiz(haveHas), sources: ['casino/lesson1/Quiz.tsx'] },
  'there-is-there-are': {
    topicType: 'grammar',
    focus: 'there is / there are',
    questions: fromQuiz(thereIsThereAre),
    sources: ['casino/lesson2/Quiz.tsx'],
  },
  demonstratives: {
    topicType: 'grammar',
    focus: 'this / that / these / those',
    questions: fromQuiz(demonstratives),
    sources: ['casino/lesson3/Quiz.tsx'],
  },
  articles: { topicType: 'grammar', focus: 'a / an / the', questions: fromQuiz(articles), sources: ['casino/lesson4/Quiz.tsx'] },

  // 🏝️ Phuket
  'present-simple': {
    topicType: 'grammar',
    focus: 'present simple (I work / she works)',
    questions: fromQuiz(presentSimple),
    sources: ['maze/lesson9/Quiz.tsx'],
  },
  'negative-sentences': { topicType: 'grammar', focus: "don't / doesn't / isn't", sources: [] },
  questions: {
    topicType: 'grammar',
    focus: 'do / does / did questions',
    questions: fromQuiz(questionWords),
    sources: ['maze/lesson5/Quiz.tsx'],
  },
  pronouns: {
    topicType: 'grammar',
    focus: 'me / my, you / your',
    questions: fromQuiz(pronouns),
    sources: ['maze/lesson6/Quiz.tsx'],
  },
  'he-she-his-her': {
    topicType: 'grammar',
    focus: 'he / she, his / her',
    questions: fromQuiz(heSheHisHer),
    sources: ['maze/lesson7/Quiz.tsx'],
  },
  'place-prepositions': {
    topicType: 'grammar',
    focus: 'in / on / at / under…',
    questions: fromQuiz(placePrepositions),
    sources: ['maze/lesson8/Quiz.tsx'],
  },

  // 🌊 Pattaya
  'past-tense-verbs': {
    topicType: 'grammar',
    focus: 'past simple verbs',
    questions: fromQuiz(pastTenseQuestions),
    sources: ['pattaya-games/lesson3/questions.ts'],
  },
  'irregular-verbs': {
    topicType: 'grammar',
    focus: 'irregular verbs: base → past → participle',
    words: VERBS.map((verb) => ({ en: `${verb.base} → ${verb.past} → ${verb.participle}` })),
    sources: ['pattaya-games/lesson1/verbs.ts'],
  },
  'future-forms': {
    topicType: 'grammar',
    focus: 'will / going to',
    questions: fromQuiz(futureForms),
    sources: ['verbs-communication/lesson3/Quiz.tsx'],
  },
  'places-directions': { topicType: 'vocabulary', focus: 'places in town, left / right / straight', sources: [] },
  'days-months': { topicType: 'vocabulary', focus: 'days of the week, months', sources: [] },
  weather: { topicType: 'vocabulary', focus: 'sunny, rainy, hot, cold…', sources: [] },
};
