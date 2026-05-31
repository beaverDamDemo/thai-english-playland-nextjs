// app/maze/lesson6/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'Can you give _______ a ride to the station?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ phone is ringing.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'She asked _______ to help with the project.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ backpack is heavier than yours.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'I saw _______ at the cafe yesterday.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'He gave _______ a compliment.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ dog is barking outside.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: "I'll meet _______ at the station.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'Could you pass _______ the salt?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ handwriting is very neat.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I brought this book for _______.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ umbrella is in the car.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She smiled at _______ when she saw me.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ keys are on the counter.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: '_______ brother is coming to visit.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Can you lend _______ your pen?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this cake for _______.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ shoes are by the door.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'He asked _______ to join him.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "I'll call _______ later.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ idea was brilliant.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'She gave _______ a gift.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I want to talk to _______ about it.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ name is written here.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Please help _______ with this.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I saw _______ at the store.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ house is painted blue.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She gave _______ a ride.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ jacket is here.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: '_______ favorite food is pasta.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Can you help _______ with this box?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I live in a small cottage. _______ house has a blue door and white walls with ivy growing on the side.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'During lunch, he leaned over and told _______ a joke that made me laugh out loud.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I will meet _______ at the library at 3 PM to study together.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I heard that your sibling plays music. _______ brother plays guitar in a band that performs on weekends.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I have two siblings. _______ sister is studying medicine at university and wants to become a surgeon.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Before the meeting starts, can you show _______ how to use this app?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this for _______ to say thank you for your help yesterday.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think that vehicle belongs to you. _______ car is parked outside the school next to the red one.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I love history class. _______ favorite subject is history, especially ancient civilizations and wars.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'This assignment is tricky. Can you help _______ with it?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "I'll call _______ when I get home to check in.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I trained my pet well. _______ dog can do tricks like jumping and rolling.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She handed me a novel. She gave _______ a book to read.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I recognized you in the crowd. I saw _______ at the concert last night.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: "This device isn't working. _______ phone can't connect to the internet.",
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I just bought a new computer. _______ laptop is very fast and reliable.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'He invited me to join the group. He asked _______ to join the team.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "Let's grab lunch together. I'll meet _______ after lunch.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'That suggestion was brilliant. _______ idea was really creative.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'My battery is low. Can you lend _______ your charger?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this dessert for you. I brought this for _______ to enjoy.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I left them by the door. _______ shoes are in the hallway.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She smiled warmly when she saw me. She smiled at _______.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "We need to discuss the details. I'll talk to _______ about the plan.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'Your writing is beautiful. _______ handwriting is very neat.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'He offered me a lift. He gave _______ a ride home.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'That coat looks familiar. I think _______ jacket is in the closet.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: "I'm expecting a visitor. _______ brother is coming to visit.",
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: "I didn't understand the instructions. Can you explain this to _______ again?",
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
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
      shuffleOptions={true}
    />
  );
}
