import {
  BaseMazeScene,
  MazeSceneConfig,
} from "../../maze/_components/BaseMazeScene";
import { getLessonConfig } from "../lessonMapConfig";

export function createStarterScene(lessonNumber: number) {
  const lessonConfig = getLessonConfig(lessonNumber);
  if (!lessonConfig) {
    throw new Error(`Starter lesson ${lessonNumber} config not found`);
  }

  const config: MazeSceneConfig = {
    sceneKey: "StarterScene",
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
