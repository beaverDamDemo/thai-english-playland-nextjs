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
  columns: number;
  left: number;
  top: number;
};

export const lessonConfigs: LessonConfig[] = [
  {
    num: 1,
    color: "#E91E63",
    colorDark: "#C2185B",
    title: "Colors",
    tile: "/assets/tinified/tile-green-1.png",
    columns: 17,
    left: 50,
    top: 82,
  },
  {
    num: 2,
    color: "#4CAF50",
    colorDark: "#388E3C",
    title: "Animals",
    tile: "/assets/tinified/tile-green-2.png",
    columns: 17,
    left: 22,
    top: 67,
  },
  {
    num: 3,
    color: "#2196F3",
    colorDark: "#1976D2",
    title: "Numbers",
    tile: "/assets/tinified/tile-brlue-1.png",
    columns: 17,
    left: 72,
    top: 53,
  },
  {
    num: 4,
    color: "#FF9800",
    colorDark: "#F57C00",
    title: "Basic Food",
    tile: "/assets/tinified/tile-brown-2.png",
    columns: 19,
    left: 28,
    top: 38,
  },
  {
    num: 5,
    color: "#9C27B0",
    colorDark: "#7B1FA2",
    title: "Clothes",
    tile: "/assets/tinified/tile-brown-1.png",
    columns: 19,
    left: 68,
    top: 23,
  },
  {
    num: 6,
    color: "#00BCD4",
    colorDark: "#0097A7",
    title: "Weather",
    tile: "/assets/tinified/tile-blue-2.png",
    columns: 19,
    left: 45,
    top: 8,
  },
];

export const lessonMapButtons: LessonMapButton[] = lessonConfigs.map(
  ({ num, color, left, top }) => ({ num, color, left, top }),
);

export function getLessonConfig(
  lessonNumber: number,
): LessonConfig | undefined {
  return lessonConfigs.find((c) => c.num === lessonNumber);
}

export function getBackgroundGradient(
  color: string,
  colorDark: string,
): string {
  return `linear-gradient(135deg, ${color} 0%, ${colorDark} 100%)`;
}
