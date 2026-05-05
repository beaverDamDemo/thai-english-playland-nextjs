export type LessonMapButton = {
  num: number;
  color: string;
  left: number;
  top: number;
};

export type LessonConfig = {
  num: number;
  color: string;
  colorDark: string;
  title: string;
  tile: string;
  left: number;
  top: number;
};

export const lessonConfigs: LessonConfig[] = [
  { num: 1, color: '#4CAF50', colorDark: '#388E3C', title: 'Nouns', tile: 'https://labs.phaser.io/assets/sprites/block.png', left: 10, top: 81 },
  { num: 2, color: '#F44336', colorDark: '#D32F2F', title: 'Verb Tenses', tile: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMkMzRTUwIiBzdHJva2U9IiMxNjIzMjgiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==', left: 70, top: 81 },
  { num: 3, color: '#FF9800', colorDark: '#F57C00', title: 'Prepositions', tile: '/assets/tinified/tile-brlue-1.png', left: 16, top: 65 },
  { num: 4, color: '#2196F3', colorDark: '#1976D2', title: 'Present Continuous', tile: '/assets/tinified/tile-green-2.png', left: 4, top: 51 },
  { num: 5, color: '#9C27B0', colorDark: '#7B1FA2', title: 'Questions', tile: '/assets/tinified/tile-green-1.png', left: 80, top: 54 },
  { num: 6, color: '#009688', colorDark: '#00796B', title: 'Pronouns', tile: '/assets/tinified/tile-brown-2.png', left: 82, top: 37 },
  { num: 7, color: '#E91E63', colorDark: '#C2185B', title: 'Pronouns (He/She)', tile: '/assets/tinified/tile-green-2.png', left: 3, top: 37 },
  { num: 8, color: '#3F51B5', colorDark: '#303F9F', title: 'Places & Prepositions', tile: 'https://labs.phaser.io/assets/sprites/block.png', left: 84, top: 25 },
  { num: 9, color: '#795548', colorDark: '#5D4037', title: 'Present Simple', tile: 'https://labs.phaser.io/assets/sprites/block.png', left: 38, top: 22 },
];

export const lessonMapButtons: LessonMapButton[] = lessonConfigs.map(
  ({ num, color, left, top }) => ({ num, color, left, top })
);

export function getLessonConfig(lessonNumber: number): LessonConfig | undefined {
  return lessonConfigs.find((config) => config.num === lessonNumber);
}

export function getBackgroundGradient(color: string, colorDark: string): string {
  return `linear-gradient(135deg, ${color} 0%, ${colorDark} 100%)`;
}