'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'When the sun shines with no clouds, the weather is _______.', options: ['cloudy', 'rainy', 'sunny', 'snowy'],   answer: 2 },
  { q: 'Water falls from the sky when it is _______.',                options: ['sunny', 'windy', 'cloudy', 'raining'], answer: 3 },
  { q: 'When the sky is covered with clouds, it is _______.',         options: ['sunny', 'cloudy', 'windy', 'hot'],     answer: 1 },
  { q: 'In winter, white _______ can fall from the sky.',             options: ['rain', 'snow', 'hail', 'fog'],         answer: 1 },
  { q: 'Trees and leaves move when it is _______.',                   options: ['hot', 'cloudy', 'windy', 'humid'],     answer: 2 },
  { q: 'The weather in summer is usually _______.',                   options: ['cold', 'snowy', 'hot', 'icy'],         answer: 2 },
  { q: 'The weather in winter is usually _______.',                   options: ['hot', 'cold', 'sunny', 'humid'],       answer: 1 },
  { q: 'When it is foggy, it is hard to _______.',                    options: ['sleep', 'eat', 'see', 'breathe'],      answer: 2 },
  { q: 'Lightning and thunder happen during a _______.',              options: ['blizzard', 'storm', 'drought', 'fog'], answer: 1 },
  { q: 'You need an umbrella when it is _______.',                    options: ['sunny', 'windy', 'raining', 'cold'],   answer: 2 },
  { q: 'Temperature is measured in _______ or Fahrenheit.',           options: ['metres', 'kilograms', 'Celsius', 'litres'], answer: 2 },
  { q: 'When it is very hot, you should drink plenty of _______.',    options: ['juice', 'milk', 'water', 'tea'],       answer: 2 },
  { q: 'A _______ is a very strong tropical storm.',                  options: ['drizzle', 'breeze', 'hurricane', 'mist'], answer: 2 },
  { q: 'When the air contains a lot of moisture, the weather is _______.',options: ['dry', 'humid', 'cold', 'clear'],   answer: 1 },
  { q: 'A long period with no rain is called a _______.',             options: ['flood', 'storm', 'drought', 'frost'],  answer: 2 },
];

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}) {
  return (
    <MazeQuiz
      questions={questions}
      onComplete={onComplete}
      primaryColor={primaryColor}
      shuffleOptions
    />
  );
}
