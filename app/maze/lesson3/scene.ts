import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#FF9800',
  defaultThemeColor: '#FF9800',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
