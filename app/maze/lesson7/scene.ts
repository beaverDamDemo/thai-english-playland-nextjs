import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#E91E63',
  defaultThemeColor: '#E91E63',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
