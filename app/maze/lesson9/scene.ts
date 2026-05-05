import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#795548',
  defaultThemeColor: '#795548',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
