import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';
import { getLessonConfig } from '../lessonMapConfig';

const lessonConfig = getLessonConfig(2);
if (!lessonConfig) throw new Error('Lesson 2 config not found');

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: lessonConfig.color,
  defaultThemeColor: lessonConfig.color,
  tile: lessonConfig.tile,
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
