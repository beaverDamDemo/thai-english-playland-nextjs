export type Food = {
  id: string;
  name: string;
  plural: string;
  article: 'a' | 'an';
  thai: string;
  emoji: string;
};

export const FOODS: Record<string, Food> = {
  apple: { id: 'apple', name: 'apple', plural: 'apples', article: 'an', thai: 'แอปเปิล', emoji: '🍎' },
  banana: { id: 'banana', name: 'banana', plural: 'bananas', article: 'a', thai: 'กล้วย', emoji: '🍌' },
  orange: { id: 'orange', name: 'orange', plural: 'oranges', article: 'an', thai: 'ส้ม', emoji: '🍊' },
  grapes: { id: 'grapes', name: 'grapes', plural: 'grapes', article: 'a', thai: 'องุ่น', emoji: '🍇' },
  strawberry: { id: 'strawberry', name: 'strawberry', plural: 'strawberries', article: 'a', thai: 'สตรอว์เบอร์รี', emoji: '🍓' },
  watermelon: { id: 'watermelon', name: 'watermelon', plural: 'watermelons', article: 'a', thai: 'แตงโม', emoji: '🍉' },
  carrot: { id: 'carrot', name: 'carrot', plural: 'carrots', article: 'a', thai: 'แครอท', emoji: '🥕' },
  tomato: { id: 'tomato', name: 'tomato', plural: 'tomatoes', article: 'a', thai: 'มะเขือเทศ', emoji: '🍅' },
  corn: { id: 'corn', name: 'corn', plural: 'corn', article: 'a', thai: 'ข้าวโพด', emoji: '🌽' },
  potato: { id: 'potato', name: 'potato', plural: 'potatoes', article: 'a', thai: 'มันฝรั่ง', emoji: '🥔' },
  broccoli: { id: 'broccoli', name: 'broccoli', plural: 'broccoli', article: 'a', thai: 'บรอกโคลี', emoji: '🥦' },
  milk: { id: 'milk', name: 'milk', plural: 'milk', article: 'a', thai: 'นม', emoji: '🥛' },
  water: { id: 'water', name: 'water', plural: 'water', article: 'a', thai: 'น้ำ', emoji: '💧' },
  juice: { id: 'juice', name: 'juice', plural: 'juice', article: 'a', thai: 'น้ำผลไม้', emoji: '🧃' },
  tea: { id: 'tea', name: 'tea', plural: 'tea', article: 'a', thai: 'ชา', emoji: '🍵' },
  bread: { id: 'bread', name: 'bread', plural: 'bread', article: 'a', thai: 'ขนมปัง', emoji: '🍞' },
  egg: { id: 'egg', name: 'egg', plural: 'eggs', article: 'an', thai: 'ไข่', emoji: '🥚' },
  rice: { id: 'rice', name: 'rice', plural: 'rice', article: 'a', thai: 'ข้าว', emoji: '🍚' },
};

export type OrderLine = { food: string; qty: number };
export type MarketRound = { order: OrderLine[]; distractors: string[] };
export type MarketLevel = { title: string; rounds: MarketRound[] };

export const MARKET_LEVELS: MarketLevel[] = [
  {
    title: 'Fruit',
    rounds: [
      {
        order: [{ food: 'apple', qty: 1 }],
        distractors: ['banana', 'orange', 'grapes', 'strawberry'],
      },
      {
        order: [
          { food: 'banana', qty: 1 },
          { food: 'orange', qty: 1 },
        ],
        distractors: ['apple', 'grapes', 'strawberry', 'watermelon'],
      },
      {
        order: [
          { food: 'grapes', qty: 1 },
          { food: 'strawberry', qty: 1 },
          { food: 'watermelon', qty: 1 },
        ],
        distractors: ['apple', 'banana', 'orange'],
      },
    ],
  },
  {
    title: 'Veg & Drinks',
    rounds: [
      {
        order: [
          { food: 'carrot', qty: 1 },
          { food: 'milk', qty: 1 },
        ],
        distractors: ['tomato', 'corn', 'water', 'juice'],
      },
      {
        order: [
          { food: 'tomato', qty: 1 },
          { food: 'corn', qty: 1 },
          { food: 'juice', qty: 1 },
        ],
        distractors: ['carrot', 'potato', 'milk', 'tea'],
      },
      {
        order: [
          { food: 'potato', qty: 1 },
          { food: 'broccoli', qty: 1 },
          { food: 'water', qty: 1 },
        ],
        distractors: ['carrot', 'corn', 'tea', 'milk'],
      },
    ],
  },
  {
    title: 'Big Order',
    rounds: [
      {
        order: [
          { food: 'apple', qty: 2 },
          { food: 'bread', qty: 1 },
        ],
        distractors: ['banana', 'egg', 'rice', 'milk'],
      },
      {
        order: [
          { food: 'carrot', qty: 3 },
          { food: 'egg', qty: 2 },
        ],
        distractors: ['tomato', 'bread', 'rice', 'juice'],
      },
      {
        order: [
          { food: 'banana', qty: 2 },
          { food: 'milk', qty: 1 },
          { food: 'tomato', qty: 3 },
        ],
        distractors: ['apple', 'bread', 'tea', 'egg'],
      },
    ],
  },
];

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];

export function lineEnglish({ food, qty }: OrderLine): string {
  const item = FOODS[food];
  return qty === 1
    ? `${item.article} ${item.name}`
    : `${NUMBER_WORDS[qty]} ${item.plural}`;
}

export function orderEnglish(order: OrderLine[]): string {
  const parts = order.map(lineEnglish);
  const joined =
    parts.length < 2
      ? parts.join('')
      : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `I want ${joined}, please.`;
}

export function orderThai(order: OrderLine[]): string {
  const parts = order.map(({ food, qty }) =>
    qty === 1 ? FOODS[food].thai : `${FOODS[food].thai} ${qty}`,
  );
  return `ฉันขอ${parts.join(' และ')}`;
}

// Small deterministic shuffle so shelf order is stable per round.
export function shuffled<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;
  for (let index = result.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = Math.floor((state / 0x100000000) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
