import type { ReactElement } from 'react';

export type NumberEntry = { value: number; en: string; th: string };

export type Stage = {
  title: string;
  titleTh: string;
  range: string;
  object: string;
  objectTh: string;
  numbers: NumberEntry[];
  // Indices into numbers, in the order they are asked; defaults to ascending.
  askOrder?: number[];
  pieces: ReactElement[][];
};

const rect = (x: number, y: number, w: number, h: number, fill: string) => (
  <rect x={x} y={y} width={w} height={h} rx={1.5} fill={fill} />
);
const poly = (points: string, fill: string) => (
  <polygon points={points} fill={fill} />
);
const circle = (cx: number, cy: number, r: number, fill: string) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} />
);

const SMALL: NumberEntry[] = [
  { value: 1, en: 'one', th: 'หนึ่ง' },
  { value: 2, en: 'two', th: 'สอง' },
  { value: 3, en: 'three', th: 'สาม' },
  { value: 4, en: 'four', th: 'สี่' },
  { value: 5, en: 'five', th: 'ห้า' },
  { value: 6, en: 'six', th: 'หก' },
  { value: 7, en: 'seven', th: 'เจ็ด' },
  { value: 8, en: 'eight', th: 'แปด' },
  { value: 9, en: 'nine', th: 'เก้า' },
  { value: 10, en: 'ten', th: 'สิบ' },
];

const TEENS: NumberEntry[] = [
  { value: 11, en: 'eleven', th: 'สิบเอ็ด' },
  { value: 12, en: 'twelve', th: 'สิบสอง' },
  { value: 13, en: 'thirteen', th: 'สิบสาม' },
  { value: 14, en: 'fourteen', th: 'สิบสี่' },
  { value: 15, en: 'fifteen', th: 'สิบห้า' },
  { value: 16, en: 'sixteen', th: 'สิบหก' },
  { value: 17, en: 'seventeen', th: 'สิบเจ็ด' },
  { value: 18, en: 'eighteen', th: 'สิบแปด' },
  { value: 19, en: 'nineteen', th: 'สิบเก้า' },
  { value: 20, en: 'twenty', th: 'ยี่สิบ' },
];

const TENS: NumberEntry[] = [
  { value: 10, en: 'ten', th: 'สิบ' },
  { value: 20, en: 'twenty', th: 'ยี่สิบ' },
  { value: 30, en: 'thirty', th: 'สามสิบ' },
  { value: 40, en: 'forty', th: 'สี่สิบ' },
  { value: 50, en: 'fifty', th: 'ห้าสิบ' },
  { value: 60, en: 'sixty', th: 'หกสิบ' },
  { value: 70, en: 'seventy', th: 'เจ็ดสิบ' },
  { value: 80, en: 'eighty', th: 'แปดสิบ' },
  { value: 90, en: 'ninety', th: 'เก้าสิบ' },
  { value: 100, en: 'one hundred', th: 'หนึ่งร้อย' },
];

const HUNDREDS: NumberEntry[] = [
  { value: 100, en: 'one hundred', th: 'หนึ่งร้อย' },
  { value: 200, en: 'two hundred', th: 'สองร้อย' },
  { value: 300, en: 'three hundred', th: 'สามร้อย' },
  { value: 400, en: 'four hundred', th: 'สี่ร้อย' },
  { value: 500, en: 'five hundred', th: 'ห้าร้อย' },
  { value: 600, en: 'six hundred', th: 'หกร้อย' },
  { value: 700, en: 'seven hundred', th: 'เจ็ดร้อย' },
  { value: 800, en: 'eight hundred', th: 'แปดร้อย' },
  { value: 900, en: 'nine hundred', th: 'เก้าร้อย' },
  { value: 1000, en: 'one thousand', th: 'หนึ่งพัน' },
];

// Each stage builds one object from 10 magnet pieces, placed bottom to top.
const HOUSE = [
  [rect(14, 88, 72, 8, '#8d99ae')],
  [rect(20, 66, 30, 22, '#f4a261')],
  [rect(50, 66, 30, 22, '#f4a261')],
  [rect(20, 46, 30, 20, '#f6b985')],
  [rect(50, 46, 30, 20, '#f6b985')],
  [rect(42, 68, 16, 20, '#7f4f24')],
  [rect(26, 52, 12, 12, '#a5d8ff'), rect(61, 52, 12, 12, '#a5d8ff')],
  [poly('10,46 50,16 50,46', '#e03131')],
  [poly('50,16 90,46 50,46', '#c92a2a')],
  [rect(68, 14, 9, 20, '#6c757d')],
];

const ROCKET = [
  [poly('26,92 38,64 38,92', '#e03131')],
  [poly('74,92 62,64 62,92', '#e03131')],
  [rect(38, 66, 24, 26, '#dee2e6')],
  [rect(38, 42, 24, 24, '#f8f9fa')],
  [poly('38,42 50,12 62,42', '#e03131')],
  [circle(50, 54, 7, '#4dabf7'), circle(50, 54, 3, '#d0ebff')],
  [rect(38, 68, 24, 5, '#e03131')],
  [rect(42, 92, 16, 6, '#868e96')],
  [poly('42,98 58,98 50,112', '#ff922b'), poly('46,98 54,98 50,106', '#ffd43b')],
  [circle(14, 24, 3, '#ffd43b'), circle(86, 36, 3, '#ffd43b'), circle(80, 12, 2, '#ffd43b')],
];

const ROBOT = [
  [rect(33, 88, 12, 20, '#495057')],
  [rect(55, 88, 12, 20, '#495057')],
  [rect(26, 54, 48, 34, '#4dabf7')],
  [rect(12, 56, 12, 28, '#74c0fc')],
  [rect(76, 56, 12, 28, '#74c0fc')],
  [rect(32, 24, 36, 28, '#adb5bd')],
  [circle(42, 36, 5, '#ffd43b'), circle(42, 36, 2, '#212529')],
  [circle(58, 36, 5, '#ffd43b'), circle(58, 36, 2, '#212529')],
  [rect(49, 8, 2.5, 16, '#6c757d'), circle(50, 8, 4.5, '#e03131')],
  [
    rect(37, 62, 26, 16, '#1864ab'),
    circle(43, 70, 2.5, '#69db7c'),
    circle(50, 70, 2.5, '#ffd43b'),
    circle(57, 70, 2.5, '#ff6b6b'),
  ],
];

const CASTLE = [
  [rect(14, 70, 72, 28, '#c9b8a0')],
  [rect(6, 46, 22, 52, '#b8a58b')],
  [rect(72, 46, 22, 52, '#b8a58b')],
  [rect(37, 36, 26, 62, '#bfae96')],
  [rect(42, 76, 16, 22, '#7f4f24'), circle(50, 76, 8, '#7f4f24')],
  [poly('4,46 17,24 30,46', '#e03131')],
  [poly('70,46 83,24 96,46', '#e03131')],
  [poly('35,36 50,16 65,36', '#1c7ed6')],
  [
    rect(13, 56, 8, 11, '#343a40'),
    rect(79, 56, 8, 11, '#343a40'),
    rect(46, 46, 8, 12, '#343a40'),
  ],
  [rect(49.5, 2, 2, 15, '#6c757d'), poly('51.5,2 64,6 51.5,10', '#ffd43b')],
];

export const STAGES: Stage[] = [
  {
    title: 'Numbers 1 to 10',
    titleTh: 'เลข 1 ถึง 10',
    range: '1–10',
    object: 'House',
    objectTh: 'บ้าน',
    numbers: SMALL,
    pieces: HOUSE,
  },
  {
    title: 'Numbers 11 to 20',
    titleTh: 'เลข 11 ถึง 20',
    range: '11–20',
    object: 'Rocket',
    objectTh: 'จรวด',
    numbers: TEENS,
    askOrder: [0, 1, 2, 3, 6, 4, 9, 5, 8, 7],
    pieces: ROCKET,
  },
  {
    title: 'Tens: 10 to 100',
    titleTh: 'สิบ: 10 ถึง 100',
    range: '10–100',
    object: 'Robot',
    objectTh: 'หุ่นยนต์',
    numbers: TENS,
    pieces: ROBOT,
  },
  {
    title: 'Hundreds: 100 to 1000',
    titleTh: 'ร้อย: 100 ถึง 1000',
    range: '100–1000',
    object: 'Castle',
    objectTh: 'ปราสาท',
    numbers: HUNDREDS,
    pieces: CASTLE,
  },
];
