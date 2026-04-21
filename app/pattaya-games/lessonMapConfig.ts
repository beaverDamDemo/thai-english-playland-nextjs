export type LessonMapButton = {
  num: number;
  color: string;
  left: number;
  top: number;
  available: boolean;
};

export const lessonMapButtons: LessonMapButton[] = [
  { num: 1, color: '#FF6B6B', left: 46, top: 79, available: true },
  { num: 2, color: '#4D96FF', left: 47, top: 67, available: true },
  { num: 3, color: '#6BCB77', left: 22, top: 56, available: true },
  { num: 4, color: '#FFD166', left: 23, top: 50, available: false },
  { num: 5, color: '#5E60CE', left: 64, top: 48, available: false },
  { num: 6, color: '#F06595', left: 22, top: 37, available: false },
  { num: 7, color: '#2EC4B6', left: 66, top: 32, available: false },
  { num: 8, color: '#F77F00', left: 22, top: 18, available: false },
];