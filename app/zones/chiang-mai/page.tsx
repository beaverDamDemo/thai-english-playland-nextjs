import CurriculumZonePage from '@/app/_games/_components/CurriculumZonePage';
import { getCurriculumZone } from '@/app/_games/curriculum';

export default function Page() {
  return <CurriculumZonePage zone={getCurriculumZone('everyday-vocabulary')!} />;
}
