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
    color: "#ffef40",
    colorDark: "#343536",
    title: "Animals",
    tile: "/assets/tinified/tile-green-2.png",
    columns: 17,
    left: 22,
    top: 67,
  },
  {
    num: 3,
    color: "#ffef40",
    colorDark: "#343536",
    title: "Numbers",
    tile: "/assets/tinified/tile-brlue-1.png",
    columns: 17,
    left: 72,
    top: 53,
  },
  {
    num: 4,
    color: "#ffef40",
    colorDark: "#343536",
    title: "Basic Food",
    tile: "/assets/tinified/tile-brown-2.png",
    columns: 19,
    left: 28,
    top: 38,
  },
  {
    num: 5,
    color: "#ffef40",
    colorDark: "#343536",
    title: "Clothes",
    tile: "/assets/tinified/tile-brown-1.png",
    columns: 19,
    left: 68,
    top: 23,
  },
  {
    num: 6,
    color: "#ffef40",
    colorDark: "#343536",
    title: "Weather",
    tile: "/assets/tinified/tile-blue-2.png",
    columns: 19,
    left: 45,
    top: 8,
  },
  {
    num: 7,
    color: "#607D8B",
    colorDark: "#455A64",
    title: "Coming Soon",
    tile: "/assets/tinified/tile-green-1.png",
    columns: 17,
    left: 55,
    top: 5,
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
