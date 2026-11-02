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
    'match-3 candy board - practice questions, then swap candies to match and score',
    'match-3 icon board - practice questions, then swap icons to match and score',
    'tank shooting - answer questions to earn shots, destroy tanks to win',
    'naval battle - fire torpedoes at the ship carrying the correct answer',
  ],
  starter: starterLessons.map((l) => l.title),
};

export function logLessonTopics(area: LessonArea): void {
  console.log(`[${area}] Lessons:`);
  topicsByArea[area].forEach((topic, i) => {
    console.log(`[${area}] Lesson ${i + 1}: ${topic}`);
  });
}
