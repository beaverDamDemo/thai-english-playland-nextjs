import CurriculumZonePage from '../_components/CurriculumZonePage';
import { curriculumZones } from '../curriculum';

export default function Page() {
  return <CurriculumZonePage zone={curriculumZones[1]} />;
}
