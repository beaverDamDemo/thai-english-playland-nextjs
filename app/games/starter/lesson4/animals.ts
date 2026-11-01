export type AnimalRound = {
  animal: string;
  animalTh: string;
  animalEmoji: string;
  food: string;
  foodTh: string;
  foodEmoji: string;
};

export type AnimalLevel = {
  title: string;
  titleTh: string;
  rounds: AnimalRound[];
};

// Solved grids needed to finish a level.
export const ROUNDS_PER_LEVEL = 1;

export const ANIMAL_LEVELS: AnimalLevel[] = [
  {
    title: 'Farm',
    titleTh: 'ฟาร์ม',
    rounds: [
      { animal: 'cow', animalTh: 'วัว', animalEmoji: '🐄', food: 'grass', foodTh: 'หญ้า', foodEmoji: '🌿' },
      { animal: 'chicken', animalTh: 'ไก่', animalEmoji: '🐔', food: 'corn', foodTh: 'ข้าวโพด', foodEmoji: '🌽' },
      { animal: 'pig', animalTh: 'หมู', animalEmoji: '🐖', food: 'apple', foodTh: 'แอปเปิล', foodEmoji: '🍎' },
      { animal: 'duck', animalTh: 'เป็ด', animalEmoji: '🦆', food: 'water', foodTh: 'น้ำ', foodEmoji: '💧' },
      { animal: 'sheep', animalTh: 'แกะ', animalEmoji: '🐑', food: 'grass', foodTh: 'หญ้า', foodEmoji: '🌿' },
    ],
  },
  {
    title: 'Pets',
    titleTh: 'สัตว์เลี้ยง',
    rounds: [
      { animal: 'dog', animalTh: 'หมา', animalEmoji: '🐕', food: 'bone', foodTh: 'กระดูก', foodEmoji: '🦴' },
      { animal: 'cat', animalTh: 'แมว', animalEmoji: '🐈', food: 'fish', foodTh: 'ปลา', foodEmoji: '🐟' },
      { animal: 'rabbit', animalTh: 'กระต่าย', animalEmoji: '🐇', food: 'carrot', foodTh: 'แครอท', foodEmoji: '🥕' },
      { animal: 'bird', animalTh: 'นก', animalEmoji: '🐦', food: 'seeds', foodTh: 'เมล็ดพืช', foodEmoji: '🌻' },
    ],
  },
  {
    title: 'Wild',
    titleTh: 'สัตว์ป่า',
    rounds: [
      { animal: 'monkey', animalTh: 'ลิง', animalEmoji: '🐒', food: 'banana', foodTh: 'กล้วย', foodEmoji: '🍌' },
      { animal: 'bear', animalTh: 'หมี', animalEmoji: '🐻', food: 'honey', foodTh: 'น้ำผึ้ง', foodEmoji: '🍯' },
      { animal: 'panda', animalTh: 'แพนด้า', animalEmoji: '🐼', food: 'bamboo', foodTh: 'ไผ่', foodEmoji: '🎋' },
      { animal: 'lion', animalTh: 'สิงโต', animalEmoji: '🦁', food: 'meat', foodTh: 'เนื้อ', foodEmoji: '🥩' },
    ],
  },
  {
    title: 'Sea',
    titleTh: 'ทะเล',
    rounds: [
      { animal: 'penguin', animalTh: 'เพนกวิน', animalEmoji: '🐧', food: 'fish', foodTh: 'ปลา', foodEmoji: '🐟' },
      { animal: 'dolphin', animalTh: 'โลมา', animalEmoji: '🐬', food: 'squid', foodTh: 'ปลาหมึก', foodEmoji: '🦑' },
      { animal: 'whale', animalTh: 'วาฬ', animalEmoji: '🐋', food: 'shrimp', foodTh: 'กุ้ง', foodEmoji: '🦐' },
      { animal: 'crab', animalTh: 'ปู', animalEmoji: '🦀', food: 'shell', foodTh: 'เปลือกหอย', foodEmoji: '🐚' },
    ],
  },
];

// Rows (0-7) of the right-hand exits, varied per round.
export const EXIT_ROWS: number[][] = [
  [1, 3, 6],
  [2, 5, 7],
  [0, 3, 5],
  [1, 4, 7],
];
