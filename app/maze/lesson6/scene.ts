import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#009688',
  defaultThemeColor: '#009688',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
