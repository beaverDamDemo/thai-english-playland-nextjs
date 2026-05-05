import { BaseMazeScene, MazeSceneConfig } from '../_components/BaseMazeScene';

const config: MazeSceneConfig = {
  sceneKey: 'MazeScene',
  backgroundColor: '#3F51B5',
  defaultThemeColor: '#3F51B5',
};

export class MazeScene extends BaseMazeScene {
  constructor() {
    super(config);
  }
}
