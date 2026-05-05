import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#4CAF50',
  defaultThemeColor: '#4CAF50',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
