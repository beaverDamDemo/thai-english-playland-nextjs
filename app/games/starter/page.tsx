import CurriculumZonePage from '../_components/CurriculumZonePage';
import { curriculumZones } from '../curriculum';

export default function StarterLearnersZonePage() {
  return <CurriculumZonePage zone={curriculumZones[0]} />;
}
