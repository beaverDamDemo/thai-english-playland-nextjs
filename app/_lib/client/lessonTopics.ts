import { lessonConfigs as starterLessons } from '@/app/games/starter/lessonMapConfig';

export type LessonArea = 'maze' | 'casino' | 'pattaya' | 'starter';

const mazeGame =
  'maze - answer quiz questions to earn moves, then walk the player to the goal';

const topicsByArea: Record<LessonArea, string[]> = {
  maze: Array.from({ length: 9 }, () => mazeGame),
  casino: [
    'poker - answer questions to collect cards and build the best hand',
    'roulette - answer questions while the wheel spins',
    'slot machine - answer questions to spin the slots',
    'slot machine - spin the slots to match the right words',
    'cashier - exchange chips by answering questions',
  ],
  pattaya: [
    'tank shooting - answer questions to earn shots, destroy tanks to win',
    'match-3 icon board - answer questions to earn moves, combo matches to reach 500 points',
    'naval battle - fire torpedoes at the ship carrying the correct answer',
    'match-3 candy board - answer questions to earn moves and score multipliers, reach 500 points to win',
  ],
  starter: starterLessons.map((l) => l.title),
};

export function logLessonTopics(area: LessonArea): void {
  console.log(`[${area}] Lessons:`);
  topicsByArea[area].forEach((topic, i) => {
    console.log(`[${area}] Lesson ${i + 1}: ${topic}`);
  });
}
