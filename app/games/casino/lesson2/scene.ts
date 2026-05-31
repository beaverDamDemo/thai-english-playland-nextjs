import * as Phaser from 'phaser';

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const ROULETTE_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

type BetType = 'RED' | 'BLACK' | 'ODD' | 'EVEN';

type BetButton = {
  key: BetType;
  rect: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  chip: Phaser.GameObjects.Container;
  chipInner: Phaser.GameObjects.Arc;
};

export class MazeScene extends Phaser.Scene {
  credits!: number;
  maxCredits!: number;
  onNoMoves!: () => void;
  onWin!: () => void;

  titleText!: Phaser.GameObjects.Text;
  creditsText!: Phaser.GameObjects.Text;
  targetText!: Phaser.GameObjects.Text;
  selectedBetText!: Phaser.GameObjects.Text;
  spinResultText!: Phaser.GameObjects.Text;
  helpText!: Phaser.GameObjects.Text;
  rewardText!: Phaser.GameObjects.Text;
  wheelContainer!: Phaser.GameObjects.Container;
  wheelHighlight!: Phaser.GameObjects.Graphics;
  ballOrbit!: Phaser.GameObjects.Container;
  wheelBall!: Phaser.GameObjects.Arc;
  wheelPointer!: Phaser.GameObjects.Triangle;

  spinButton!: Phaser.GameObjects.Rectangle;
  spinButtonText!: Phaser.GameObjects.Text;
  betButtons: BetButton[] = [];

  selectedBet: BetType = 'RED';
  wins = 0;
  targetWins = 3;
  won = false;
  finishTriggered = false;
  isSpinning = false;
  wheelRadius = 106;

  spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('MazeScene');
  }

  create() {
    this.maxCredits = this.registry.get('maxMoves') ?? 0;
    this.credits = this.maxCredits;
    this.onNoMoves = this.registry.get('onNoMoves') || (() => { });
    this.onWin = this.registry.get('onWin') || (() => { });

    const width = Number(this.sys.game.config.width);
    const height = Number(this.sys.game.config.height);

    this.drawBackground(width, height);

    this.titleText = this.add.text(16, 16, 'ROULETTE ENGLISH CHALLENGE', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.creditsText = this.add.text(16, 54, '', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.targetText = this.add.text(16, 84, '', {
      fontSize: '16px',
      color: '#ffe9a8',
    });

    this.helpText = this.add.text(
      16,
      116,
      'Pick a bet type, then spin.\nCorrect bet = +1 bonus credit and +1 win.',
      {
        fontSize: '15px',
        color: '#f9f3f3',
        lineSpacing: 4,
      },
    );

    this.createRouletteWheel(width / 2, 254);

    this.add.text(16, 372, 'Choose Bet Type', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.createBetButtons();

    this.selectedBetText = this.add.text(16, 490, '', {
      fontSize: '17px',
      color: '#fff6b0',
      fontStyle: 'bold',
    });

    this.spinResultText = this.add.text(16, 522, 'Spin result will appear here.', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      wordWrap: { width: width - 32 },
    });

    this.rewardText = this.add.text(16, 594, '', {
      fontSize: '17px',
      color: '#fff59d',
      fontStyle: 'bold',
      wordWrap: { width: width - 32 },
      lineSpacing: 5,
    });

    this.spinButton = this.add
      .rectangle(width / 2, height - 52, 220, 56, 0x1b5e20)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.spinButtonText = this.add
      .text(width / 2, height - 52, 'SPIN ROULETTE', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.spinButton.on('pointerdown', () => this.handleSpinPress());
    this.spinButton.on('pointerover', () => {
      this.spinButton.setFillStyle(this.won ? 0xe0a106 : 0x2e7d32);
    });
    this.spinButton.on('pointerout', () => {
      this.spinButton.setFillStyle(this.won ? 0xc88700 : 0x1b5e20);
    });

    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      );
    }

    this.render();
  }

  update() {
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleSpinPress();
    }
  }

  addMoreMovesToScene(newMoves: number) {
    this.credits += newMoves;
    this.maxCredits = Math.max(this.maxCredits, this.credits);
    this.render();
  }

  private drawBackground(width: number, height: number) {
    const g = this.add.graphics();

    g.fillStyle(0x2c0f19, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x5e1426, 0.45);
    for (let i = 0; i < 9; i += 1) {
      g.fillCircle(56 + i * 52, 88 + ((i % 2) * 12), 28);
    }

    g.lineStyle(2, 0x8f1d33, 0.55);
    for (let y = 150; y < height; y += 34) {
      g.strokeLineShape(new Phaser.Geom.Line(0, y, width, y));
    }
  }

  private createBetButtons() {
    const entries: Array<{ key: BetType; label: string; color: number; }> = [
      { key: 'RED', label: 'Red', color: 0xb71c1c },
      { key: 'BLACK', label: 'Black', color: 0x212121 },
      { key: 'ODD', label: 'Odd', color: 0x1565c0 },
      { key: 'EVEN', label: 'Even', color: 0x2e7d32 },
    ];

    entries.forEach((entry, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 132 + col * 236;
      const y = 418 + row * 50;

      const rect = this.add
        .rectangle(x, y, 200, 40, entry.color)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(x, y, entry.label.toUpperCase(), {
          fontSize: '18px',
          color: '#fff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const chipBase = this.add.circle(x - 74, y, 12, 0xf5e6b3, 1);
      chipBase.setStrokeStyle(3, 0xc4952f);
      const chipInner = this.add.circle(x - 74, y, 7, entry.color, 1);
      const chipText = this.add
        .text(x - 74, y, '$', {
          fontSize: '12px',
          color: '#fffdf3',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const chip = this.add.container(x - 74, y, [
        chipBase.setPosition(0, 0),
        chipInner.setPosition(0, 0),
        chipText.setPosition(0, 0),
      ]);

      rect.on('pointerdown', () => {
        if (this.isSpinning) return;
        this.selectedBet = entry.key;
        this.render();
      });

      this.betButtons.push({ key: entry.key, rect, label, chip, chipInner });
    });
  }

  private createRouletteWheel(centerX: number, centerY: number) {
    const wheelRadius = this.wheelRadius;
    const innerRadius = 34;
    const segmentAngle = Phaser.Math.PI2 / ROULETTE_SEQUENCE.length;
    const wheelGraphic = this.add.graphics();

    wheelGraphic.fillStyle(0x8f6b23, 1);
    wheelGraphic.fillCircle(0, 0, wheelRadius + 14);
    wheelGraphic.fillStyle(0x3a2105, 1);
    wheelGraphic.fillCircle(0, 0, wheelRadius + 6);

    ROULETTE_SEQUENCE.forEach((value, index) => {
      const start = -Math.PI / 2 + index * segmentAngle;
      const end = start + segmentAngle;
      const isRed = RED_NUMBERS.has(value);
      const fillColor = value === 0 ? 0x1e8f48 : isRed ? 0xc62828 : 0x161616;

      wheelGraphic.fillStyle(fillColor, 1);
      wheelGraphic.beginPath();
      wheelGraphic.moveTo(0, 0);
      wheelGraphic.arc(0, 0, wheelRadius, start, end, false);
      wheelGraphic.closePath();
      wheelGraphic.fillPath();

      wheelGraphic.lineStyle(2, 0xf6d689, 0.85);
      wheelGraphic.beginPath();
      wheelGraphic.moveTo(0, 0);
      wheelGraphic.arc(0, 0, wheelRadius, start, end, false);
      wheelGraphic.closePath();
      wheelGraphic.strokePath();
    });

    wheelGraphic.fillStyle(0x2c1608, 1);
    wheelGraphic.fillCircle(0, 0, innerRadius + 18);
    wheelGraphic.fillStyle(0xd5b36a, 1);
    wheelGraphic.fillCircle(0, 0, innerRadius + 10);
    wheelGraphic.fillStyle(0x562d13, 1);
    wheelGraphic.fillCircle(0, 0, innerRadius);

    const numberTexts: Phaser.GameObjects.Text[] = ROULETTE_SEQUENCE.map(
      (value, index) => {
        const angle = -Math.PI / 2 + (index + 0.5) * segmentAngle;
        const textRadius = wheelRadius - 20;
        return this.add
          .text(
            Math.cos(angle) * textRadius,
            Math.sin(angle) * textRadius,
            String(value),
            {
              fontSize: value === 0 ? '11px' : '10px',
              color: '#fff7d6',
              fontStyle: 'bold',
            },
          )
          .setOrigin(0.5)
          .setRotation(angle + Math.PI / 2);
      },
    );

    this.wheelHighlight = this.add.graphics();

    this.wheelContainer = this.add.container(centerX, centerY, [
      wheelGraphic,
      ...numberTexts,
      this.wheelHighlight,
    ]);

    const hubGlow = this.add.circle(centerX, centerY, 16, 0xffecb3, 0.3);
    this.tweens.add({
      targets: hubGlow,
      alpha: { from: 0.2, to: 0.55 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    this.ballOrbit = this.add.container(centerX, centerY);
    this.wheelBall = this.add.circle(0, -(wheelRadius + 4), 7, 0xfafafa, 1);
    this.wheelBall.setStrokeStyle(2, 0xd4d4d4);
    this.ballOrbit.add(this.wheelBall);

    this.wheelPointer = this.add
      .triangle(centerX, centerY - (wheelRadius + 22), 0, 0, 18, 0, 9, 18, 0xf8e16c)
      .setStrokeStyle(2, 0x5c4100);
  }

  private handleSpinPress() {
    if (this.won) {
      if (!this.finishTriggered) {
        this.finishTriggered = true;
        this.onWin();
      }
      return;
    }

    if (this.credits <= 0) {
      this.onNoMoves();
      return;
    }

    if (this.isSpinning) return;

    this.spinRoulette();
  }

  private spinRoulette() {
    this.isSpinning = true;
    this.credits -= 1;
    this.clearWheelHighlight();

    const number = Phaser.Math.Between(0, 36);
    const resultColor = this.getRouletteColor(number);
    const targetRotation = this.getTargetWheelRotation(number);
    const currentRotation = Phaser.Math.Angle.Wrap(this.wheelContainer.rotation);
    let delta = Phaser.Math.Angle.Wrap(targetRotation - currentRotation);
    if (delta < 0) delta += Phaser.Math.PI2;
    const extraTurns = Phaser.Math.Between(4, 6) * Phaser.Math.PI2;
    const finalWheelRotation = this.wheelContainer.rotation + extraTurns + delta;
    const finalBallRotation =
      this.ballOrbit.rotation - extraTurns * 1.35 - delta * 1.5;

    this.spinResultText.setText('Spinning wheel...');
    this.rewardText.setText('The ball is moving. Watch the wheel.');
    this.playSpinSounds();
    this.render();

    this.tweens.add({
      targets: this.wheelContainer,
      rotation: finalWheelRotation,
      duration: 2200,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: this.ballOrbit,
      rotation: finalBallRotation,
      duration: 2200,
      ease: 'Quart.easeOut',
      onComplete: () => {
        this.finishSpin(number, resultColor);
      },
    });
  }

  private finishSpin(number: number, resultColor: 'Green' | 'Red' | 'Black') {
    const win = this.isWinningBet(number, this.selectedBet);
    this.highlightResultSegment(number, resultColor);

    if (win) {
      this.wins += 1;
      this.credits += 1;
      this.playWinSound(this.wins >= this.targetWins);
      this.rewardText.setText(
        `Win! ${number} ${resultColor}. Bonus +1 credit.\nWins: ${this.wins}/${this.targetWins}`,
      );
    } else {
      this.playLoseSound();
      this.rewardText.setText(
        `Missed. ${number} ${resultColor}. Try again.\nWins: ${this.wins}/${this.targetWins}`,
      );
    }

    this.spinResultText.setText(`Ball landed on ${number} (${resultColor})`);

    if (this.wins >= this.targetWins) {
      this.won = true;
      this.rewardText.setText(
        `Jackpot! You reached ${this.targetWins} winning spins.\nPress SPIN ROULETTE again to finish lesson.`,
      );
    } else if (this.credits <= 0) {
      this.onNoMoves();
    }

    this.isSpinning = false;
    this.render();
  }

  private clearWheelHighlight() {
    this.wheelHighlight.clear();
    this.wheelHighlight.setAlpha(0);
    this.tweens.killTweensOf(this.wheelHighlight);
  }

  private highlightResultSegment(
    number: number,
    resultColor: 'Green' | 'Red' | 'Black',
  ) {
    const index = ROULETTE_SEQUENCE.indexOf(number);
    if (index < 0) return;

    const segmentAngle = Phaser.Math.PI2 / ROULETTE_SEQUENCE.length;
    const start = -Math.PI / 2 + index * segmentAngle;
    const end = start + segmentAngle;
    const glowColor =
      resultColor === 'Green'
        ? 0x7fffb0
        : resultColor === 'Red'
          ? 0xffc2bf
          : 0xf6e7b0;

    this.wheelHighlight.clear();
    this.wheelHighlight.fillStyle(glowColor, 0.34);
    this.wheelHighlight.lineStyle(5, 0xfff6d5, 0.95);
    this.wheelHighlight.beginPath();
    this.wheelHighlight.moveTo(0, 0);
    this.wheelHighlight.arc(0, 0, this.wheelRadius + 2, start, end, false);
    this.wheelHighlight.closePath();
    this.wheelHighlight.fillPath();
    this.wheelHighlight.strokePath();
    this.wheelHighlight.setAlpha(1);

    this.tweens.add({
      targets: this.wheelHighlight,
      alpha: { from: 1, to: 0.42 },
      duration: 280,
      yoyo: true,
      repeat: 3,
    });
  }

  private getAudioContext() {
    if (typeof window === 'undefined') return null;
    const audioWindow = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
      __rouletteAudioContext?: AudioContext;
    };
    const AudioCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioWindow.__rouletteAudioContext) {
      audioWindow.__rouletteAudioContext = new AudioCtor();
    }
    return audioWindow.__rouletteAudioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
  ) {
    const audioContext = this.getAudioContext();
    if (!audioContext) return;

    const startAt = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  private playSpinSounds() {
    for (let index = 0; index < 10; index += 1) {
      this.playTone(900 - index * 28, 0.05, 'square', 0.018, index * 0.11);
    }
  }

  private playWinSound(isJackpot: boolean) {
    const notes = isJackpot ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    notes.forEach((note, index) => {
      this.playTone(note, 0.16, 'triangle', 0.035, index * 0.08);
    });
  }

  private playLoseSound() {
    this.playTone(240, 0.14, 'sawtooth', 0.028, 0);
    this.playTone(190, 0.18, 'sawtooth', 0.022, 0.08);
  }

  private getTargetWheelRotation(number: number) {
    const index = ROULETTE_SEQUENCE.indexOf(number);
    return -(index * (Phaser.Math.PI2 / ROULETTE_SEQUENCE.length));
  }

  private getRouletteColor(number: number): 'Green' | 'Red' | 'Black' {
    if (number === 0) return 'Green';
    return RED_NUMBERS.has(number) ? 'Red' : 'Black';
  }

  private isWinningBet(number: number, bet: BetType) {
    switch (bet) {
      case 'RED':
        return number !== 0 && RED_NUMBERS.has(number);
      case 'BLACK':
        return number !== 0 && !RED_NUMBERS.has(number);
      case 'ODD':
        return number !== 0 && number % 2 === 1;
      case 'EVEN':
        return number !== 0 && number % 2 === 0;
      default:
        return false;
    }
  }

  private render() {
    this.creditsText.setText(`Credits: ${this.credits}`);
    this.targetText.setText(
      `Goal: Reach ${this.targetWins} winning spins to clear the lesson.`,
    );
    this.selectedBetText.setText(`Selected Bet: ${this.selectedBet}`);

    this.betButtons.forEach(({ key, rect, label, chip, chipInner }) => {
      const isActive = key === this.selectedBet;
      rect.setStrokeStyle(2, isActive ? 0xfff176 : 0xffffff);
      rect.setScale(isActive ? 1.03 : 1);
      rect.setAlpha(this.isSpinning ? 0.72 : 1);
      label.setAlpha(this.isSpinning ? 0.8 : 1);
      chipInner.setFillStyle(rect.fillColor);
      chip.setVisible(isActive);
      chip.setAlpha(this.isSpinning ? 0.85 : 1);
      chip.setScale(isActive ? 1 : 0.96);
    });

    if (this.isSpinning) {
      this.spinButton.setFillStyle(0x616161);
      this.spinButtonText.setText('SPINNING...');
    } else if (this.won) {
      this.spinButton.setFillStyle(0xc88700);
      this.spinButtonText.setText('FINISH LESSON');
    } else {
      this.spinButton.setFillStyle(0x1b5e20);
      this.spinButtonText.setText('SPIN ROULETTE');
    }
  }
}
