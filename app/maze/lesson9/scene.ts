import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';
import { getLessonConfig } from '../lessonMapConfig';

const lessonConfig = getLessonConfig(9);
if (!lessonConfig) throw new Error('Lesson 9 config not found');

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: lessonConfig.color,
  defaultThemeColor: lessonConfig.color,
  tile: lessonConfig.tile,
  columns: lessonConfig.columns,
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
