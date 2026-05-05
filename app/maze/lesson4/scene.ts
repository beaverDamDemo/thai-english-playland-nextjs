import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#2196F3',
  defaultThemeColor: '#2196F3',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
