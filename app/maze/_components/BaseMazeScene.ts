import * as Phaser from 'phaser';

export interface MazeSceneConfig {
  sceneKey: string;
  backgroundColor: string;
  defaultThemeColor: string;
  tile?: string;
}

export class BaseMazeScene extends Phaser.Scene {
  // Common fields
  gridX!: number;
  gridY!: number;
  goalX!: number;
  goalY!: number;
  tileSize!: number;
  walkSpeed!: number;
  movesRemaining!: number;
  maxMoves!: number;
  onNoMoves!: () => void;
  onWin!: () => void;
  addMoreMoves!: (moves: number) => void;

  maze!: number[][];
  player!: Phaser.GameObjects.Sprite;
  goal!: Phaser.GameObjects.Sprite;
  winText!: Phaser.GameObjects.Text;
  movesText!: Phaser.GameObjects.Text;

  enemies!: Phaser.Physics.Arcade.Group;
  bullets!: Phaser.Physics.Arcade.Group;

  fireBtn!: Phaser.GameObjects.Text;
  upBtn!: Phaser.GameObjects.Container;
  downBtn!: Phaser.GameObjects.Container;
  leftBtn!: Phaser.GameObjects.Container;
  rightBtn!: Phaser.GameObjects.Container;

  moving!: boolean;
  playerTween!: Phaser.Tweens.Tween | null;
  lastDir!: { dx: number; dy: number; };
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wKey!: Phaser.Input.Keyboard.Key;
  aKey!: Phaser.Input.Keyboard.Key;
  sKey!: Phaser.Input.Keyboard.Key;
  dKey!: Phaser.Input.Keyboard.Key;

  protected config: MazeSceneConfig;

  constructor(config: MazeSceneConfig) {
    super(config.sceneKey);
    this.config = config;
  }

  preload() {
    this.load.spritesheet(
      'avatar',
      'https://labs.phaser.io/assets/sprites/dude.png',
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.image('goal', 'https://labs.phaser.io/assets/sprites/star.png');
    this.load.image('wall', this.config.tile || 'https://labs.phaser.io/assets/sprites/block.png');
    this.load.image('enemy', '/assets/tinified/little-menace.png');
    this.load.image(
      'bullet',
      'https://labs.phaser.io/assets/sprites/bullet.png',
    );
  }

  create() {
    const rows = 21,
      cols = 21;
    this.tileSize = 24;
    this.walkSpeed = 70;

    // Get maxMoves from registry (set by React component)
    this.maxMoves = this.registry.get('maxMoves') ?? 5;
    this.movesRemaining = this.maxMoves;
    this.onNoMoves = this.registry.get('onNoMoves') || (() => { });
    this.onWin = this.registry.get('onWin') || (() => { });
    this.addMoreMoves =
      this.registry.get('addMoreMoves') || (() => { });
    const themeColor = this.registry.get('themeColor') || this.config.defaultThemeColor;

    this.cameras.main.setBackgroundColor(this.config.backgroundColor);
    this.maze = this.generateMaze(rows, cols);

    // Allow subclasses to modify maze
    this.customizeMaze(this.maze, rows, cols);

    // Walls
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (this.maze[y][x] === 1) {
          this.add
            .image(x * this.tileSize, y * this.tileSize, 'wall')
            .setOrigin(0)
            .setDisplaySize(this.tileSize, this.tileSize);
        }
      }
    }

    // Player
    this.gridX = 1;
    this.gridY = 1;
    this.goalX = cols - 2;
    this.goalY = rows - 2;
    this.player = this.add
      .sprite(
        this.gridX * this.tileSize,
        this.gridY * this.tileSize,
        'avatar',
        4,
      )
      .setOrigin(0)
      .setDisplaySize(this.tileSize, this.tileSize);

    // Goal
    this.goal = this.add
      .sprite(this.goalX * this.tileSize, this.goalY * this.tileSize, 'goal')
      .setOrigin(0)
      .setDisplaySize(this.tileSize, this.tileSize);

    this.winText = this.add
      .text(100, 200, 'YOU WIN!', { fontSize: '32px', color: '#fff' })
      .setVisible(false);

    // Display moves remaining
    this.movesText = this.add
      .text(10, 10, `Moves: ${this.movesRemaining}/${this.maxMoves}`, {
        fontSize: '18px',
        color: '#fff',
      })
      .setOrigin(0);

    // Animations
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('avatar', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('avatar', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.moving = false;
    this.playerTween = null;
    this.lastDir = { dx: 1, dy: 0 };

    // Enemies
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const ex = Phaser.Math.Between(2, cols - 3);
      const ey = Phaser.Math.Between(2, rows - 3);
      if (this.maze[ey][ex] === 0 && !(ex === 1 && ey === 1)) {
        const enemy = this.enemies
          .create(ex * this.tileSize, ey * this.tileSize, 'enemy')
          .setOrigin(0)
          .setDisplaySize(this.tileSize, this.tileSize) as Phaser.GameObjects.Sprite & { gridX?: number; gridY?: number; };
        enemy.gridX = ex;
        enemy.gridY = ey;
      }
    }

    // Bullets
    this.bullets = this.physics.add.group();
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bulletObj, enemyObj) => {
        const bulletGO = bulletObj as Phaser.GameObjects.Sprite;
        const enemyGO = enemyObj as Phaser.GameObjects.Sprite;
        if (!bulletGO.active || !enemyGO.active) return;

        bulletGO.destroy();
        const hitFx = this.add
          .text(
            enemyGO.x + enemyGO.displayWidth / 2,
            enemyGO.y + enemyGO.displayHeight / 2,
            '💥',
            { fontSize: '26px' },
          )
          .setOrigin(0.5)
          .setDepth(1000);
        this.tweens.add({
          targets: hitFx,
          scale: { from: 0.45, to: 1.05 },
          alpha: { from: 1, to: 0 },
          duration: 220,
          ease: 'Cubic.Out',
          onComplete: () => hitFx.destroy(),
        });
        enemyGO.destroy();
      },
    );

    // Mobile controls
    this.createMobileControls(themeColor);

    // Keyboard controls
    this.setupKeyboardControls();
  }

  protected createMobileControls(themeColor: string) {
    const centerX = Number(this.sys.game.config.width) / 2;
    const baseY = Number(this.sys.game.config.height) - 105;
    const btnSize = 60;

    // Helper to create styled button
    const createButton = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right') => {
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(Phaser.Display.Color.HexStringToColor(themeColor).color, 1);
      bg.fillRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
      bg.lineStyle(3, 0xffffff, 0.3);
      bg.strokeRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
      container.add(bg);

      const arrow = this.add.graphics();
      arrow.fillStyle(0xffffff, 1);
      const arrowSize = 20;
      const offset = 8;
      if (direction === 'up') {
        arrow.beginPath();
        arrow.moveTo(0, -offset);
        arrow.lineTo(-arrowSize, -offset + arrowSize);
        arrow.lineTo(arrowSize, -offset + arrowSize);
        arrow.closePath();
        arrow.fillPath();
      } else if (direction === 'down') {
        arrow.beginPath();
        arrow.moveTo(0, offset);
        arrow.lineTo(-arrowSize, offset - arrowSize);
        arrow.lineTo(arrowSize, offset - arrowSize);
        arrow.closePath();
        arrow.fillPath();
      } else if (direction === 'left') {
        arrow.beginPath();
        arrow.moveTo(-offset, 0);
        arrow.lineTo(-offset + arrowSize, -arrowSize);
        arrow.lineTo(-offset + arrowSize, arrowSize);
        arrow.closePath();
        arrow.fillPath();
      } else if (direction === 'right') {
        arrow.beginPath();
        arrow.moveTo(offset, 0);
        arrow.lineTo(offset - arrowSize, -arrowSize);
        arrow.lineTo(offset - arrowSize, arrowSize);
        arrow.closePath();
        arrow.fillPath();
      }
      container.add(arrow);

      container.setSize(btnSize, btnSize);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.ValueToColor(Phaser.Display.Color.HexStringToColor(themeColor).color).darken(30).color, 1);
        bg.fillRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
        bg.lineStyle(3, 0xffffff, 0.3);
        bg.strokeRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
      });
      container.on('pointerup', () => {
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(themeColor).color, 1);
        bg.fillRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
        bg.lineStyle(3, 0xffffff, 0.3);
        bg.strokeRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
      });
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(themeColor).color, 1);
        bg.fillRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
        bg.lineStyle(3, 0xffffff, 0.3);
        bg.strokeRoundedRect(-btnSize / 2, -btnSize / 2, btnSize, btnSize, 12);
      });

      return container;
    };

    this.fireBtn = this.add
      .text(centerX + 150, baseY, '🔥', { fontSize: '64px' })
      .setOrigin(0.5)
      .setInteractive();
    this.fireBtn.on('pointerdown', () => this.fireWeapon());

    this.upBtn = createButton(centerX, baseY - 70, 'up');
    this.downBtn = createButton(centerX, baseY + 70, 'down');
    this.leftBtn = createButton(centerX - 70, baseY, 'left');
    this.rightBtn = createButton(centerX + 70, baseY, 'right');

    this.upBtn.on('pointerdown', () =>
      this.autoWalk({ dx: 0, dy: -1, anim: 'right' }),
    );
    this.downBtn.on('pointerdown', () =>
      this.autoWalk({ dx: 0, dy: 1, anim: 'left' }),
    );
    this.leftBtn.on('pointerdown', () => this.autoWalk({ dx: -1, dy: 0, anim: 'left' }));
    this.rightBtn.on('pointerdown', () => this.autoWalk({ dx: 1, dy: 0, anim: 'right' }));
  }

  protected setupKeyboardControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // WASD keys
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update() {
    // Arrow keys
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.autoWalk({ dx: 0, dy: -1, anim: 'right' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.autoWalk({ dx: 0, dy: 1, anim: 'left' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.autoWalk({ dx: -1, dy: 0, anim: 'left' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.autoWalk({ dx: 1, dy: 0, anim: 'right' });
    }

    // WASD keys
    if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
      this.autoWalk({ dx: 0, dy: -1, anim: 'right' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      this.autoWalk({ dx: 0, dy: 1, anim: 'left' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
      this.autoWalk({ dx: -1, dy: 0, anim: 'left' });
    }
    if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
      this.autoWalk({ dx: 1, dy: 0, anim: 'right' });
    }
  }

  fireWeapon() {
    const bulletOffset = this.tileSize / 4;
    const bullet = this.bullets
      .create(
        this.player.x + this.tileSize / 2 - bulletOffset,
        this.player.y + this.tileSize / 2 - bulletOffset,
        'bullet',
      )
      .setOrigin(0)
      .setDisplaySize(this.tileSize / 2, this.tileSize / 2);
    (bullet.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (bullet.body as Phaser.Physics.Arcade.Body).setSize(
      this.tileSize / 2,
      this.tileSize / 2,
      true,
    );
    this.physics.velocityFromRotation(
      Phaser.Math.Angle.Between(0, 0, this.lastDir.dx, this.lastDir.dy),
      200,
      (bullet as Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.Body; }).body.velocity,
    );
  }

  autoWalk(dir: { dx: number; dy: number; anim: string; }) {
    if (this.moving) return;

    // Check if player has moves remaining
    if (this.movesRemaining <= 0) {
      this.onNoMoves();
      return;
    }

    this.moving = true;
    this.lastDir = dir;

    if (this.playerTween && this.playerTween.isPlaying()) {
      this.playerTween.stop();
      this.playerTween = null;
      this.player.anims.stop();
    }

    let x = this.gridX,
      y = this.gridY,
      steps = 0;
    while (true) {
      const nx = x + dir.dx,
        ny = y + dir.dy;
      if (!this.isPath(nx, ny)) break;
      if (
        this.enemies
          .getChildren()
          .some((e: Phaser.GameObjects.GameObject & { gridX?: number; gridY?: number; }) => e.gridX === nx && e.gridY === ny)
      )
        break;

      x = nx;
      y = ny;
      steps++;
      if (x === this.goalX && y === this.goalY) break;
      if (this.degree(x, y) !== 2) break;
    }

    if (steps === 0) {
      this.moving = false;
      return;
    }

    this.player.anims.play(dir.anim, true);
    const duration = Math.max(1, this.walkSpeed * steps);

    this.playerTween = this.tweens.add({
      targets: this.player,
      x: x * this.tileSize,
      y: y * this.tileSize,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.gridX = x;
        this.gridY = y;
        this.player.setPosition(
          this.gridX * this.tileSize,
          this.gridY * this.tileSize,
        );
        this.player.anims.stop();
        this.player.setFrame(4);
        this.moving = false;
        this.playerTween = null;

        // Consume one move
        this.movesRemaining--;
        this.movesText.setText(
          `Moves: ${this.movesRemaining}/${this.maxMoves}`,
        );

        const reachedGoal = this.gridX === this.goalX && this.gridY === this.goalY;
        if (reachedGoal) {
          this.winText.setVisible(true);
          this.onWin();
        }
        if (!reachedGoal && this.movesRemaining <= 0) {
          this.onNoMoves();
        }
      },
    });
  }

  isPath(x: number, y: number) {
    return (
      y >= 0 &&
      y < this.maze.length &&
      x >= 0 &&
      x < this.maze[0].length &&
      this.maze[y][x] === 0
    );
  }

  degree(x: number, y: number) {
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];
    let count = 0;
    for (const d of dirs) if (this.isPath(x + d.dx, y + d.dy)) count++;
    return count;
  }

  addMoreMovesToScene(newMoves: number) {
    this.movesRemaining += newMoves;
    this.maxMoves += newMoves;
    this.movesText.setText(`Moves: ${this.movesRemaining}/${this.maxMoves}`);
  }

  // Override in subclasses for custom maze modifications
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected customizeMaze(_maze: number[][], _rows: number, _cols: number): void {
    // Default: no customization
  }

  generateMaze(rows: number, cols: number) {
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack: { x: number; y: number; }[] = [];
    const start = { x: 1, y: 1 };
    maze[start.y][start.x] = 0;
    stack.push(start);

    const dirs = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 },
    ];

    while (stack.length) {
      const cur = stack[stack.length - 1];
      Phaser.Utils.Array.Shuffle(dirs);

      const neighbors = dirs
        .map((d) => ({ x: cur.x + d.dx, y: cur.y + d.dy, dx: d.dx, dy: d.dy }))
        .filter(
          (n) =>
            n.x > 0 &&
            n.x < cols - 1 &&
            n.y > 0 &&
            n.y < rows - 1 &&
            maze[n.y][n.x] === 1,
        );

      if (neighbors.length) {
        const next = neighbors[0];
        maze[next.y][next.x] = 0;
        maze[cur.y + next.dy / 2][cur.x + next.dx / 2] = 0;
        stack.push(next);

        if (neighbors.length > 1 && Math.random() < 0.3) {
          const extra = neighbors[1];
          maze[extra.y][extra.x] = 0;
          maze[cur.y + extra.dy / 2][cur.x + extra.dx / 2] = 0;
        }
      } else {
        stack.pop();
      }
    }

    return maze;
  }
}
