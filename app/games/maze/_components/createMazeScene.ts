import { BaseMazeScene, MazeSceneConfig } from './BaseMazeScene';
import { getLessonConfig } from '../lessonMapConfig';

export function createMazeScene(lessonNumber: number) {
  const lessonConfig = getLessonConfig(lessonNumber);
  if (!lessonConfig) {
    throw new Error(`Lesson ${lessonNumber} config not found`);
  }

  const config: MazeSceneConfig = {
    sceneKey: 'MazeScene',
    backgroundColor: lessonConfig.color,
    defaultThemeColor: lessonConfig.color,
    tile: lessonConfig.tile,
    columns: lessonConfig.columns,
  };

  return class MazeScene extends BaseMazeScene {
    constructor() {
      super(config);
    }
  };
}
