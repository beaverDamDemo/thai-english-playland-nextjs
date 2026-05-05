import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#F44336',
  defaultThemeColor: '#F44336',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
