import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#9C27B0',
  defaultThemeColor: '#9C27B0',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
