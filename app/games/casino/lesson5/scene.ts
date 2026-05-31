import * as Phaser from 'phaser';

type ChipType = {
  name: string;
  value: number;
  color: number;
};

type CashierRound = {
  prompt: string;
  correct: number;
  options: number[];
  chipCount: number;
};

const CHIP_TYPES: ChipType[] = [
  { name: 'white', value: 5, color: 0xf3f4f6 },
  { name: 'red', value: 10, color: 0xe63946 },
  { name: 'green', value: 25, color: 0x2a9d8f },
  { name: 'black', value: 100, color: 0x1f2937 },
];

export class MazeScene extends Phaser.Scene {
  credits!: number;
  maxCredits!: number;
  onNoMoves!: () => void;
  onWin!: () => void;

  titleText!: Phaser.GameObjects.Text;
  creditsText!: Phaser.GameObjects.Text;
  goalText!: Phaser.GameObjects.Text;
  promptText!: Phaser.GameObjects.Text;
  resultText!: Phaser.GameObjects.Text;
  rewardText!: Phaser.GameObjects.Text;

  panel!: Phaser.GameObjects.Rectangle;
  cashierDesk!: Phaser.GameObjects.Rectangle;
  playerDesk!: Phaser.GameObjects.Rectangle;

  answerButtons: Array<{
    box: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    value: number;
  }> = [];

  actionButton!: Phaser.GameObjects.Rectangle;
  actionButtonText!: Phaser.GameObjects.Text;

  currentRound: CashierRound | null = null;
  wins = 0;
  targetWins = 3;
  won = false;
  finishTriggered = false;
  isResolving = false;

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

    this.titleText = this.add.text(16, 16, 'CASHIER & CHIP EXCHANGE', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.creditsText = this.add.text(16, 54, '', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.goalText = this.add.text(16, 84, '', {
      fontSize: '16px',
      color: '#ffe9a8',
    });

    this.promptText = this.add.text(
      16,
      122,
      '',
      {
        fontSize: '18px',
        color: '#fff',
        fontStyle: 'bold',
        wordWrap: { width: width - 32 },
        lineSpacing: 6,
      },
    );

    this.panel = this.add.rectangle(width / 2, 300, width - 28, 278, 0x153d39, 0.95);
    this.panel.setStrokeStyle(3, 0xbbe7df, 0.65);
    this.panel.setRounded(16);

    this.cashierDesk = this.add.rectangle(122, 260, 180, 58, 0x264653, 1);
    this.cashierDesk.setStrokeStyle(2, 0xffffff, 0.55);
    this.cashierDesk.setRounded(10);
    this.add
      .text(122, 260, 'CASHIER', {
        fontSize: '16px',
        color: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.playerDesk = this.add.rectangle(width - 122, 260, 180, 58, 0x1d3557, 1);
    this.playerDesk.setStrokeStyle(2, 0xffffff, 0.55);
    this.playerDesk.setRounded(10);
    this.add
      .text(width - 122, 260, 'PLAYER', {
        fontSize: '16px',
        color: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.createAnswerButtons(width);

    this.resultText = this.add.text(16, 470, 'Choose the correct total value.', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      wordWrap: { width: width - 32 },
    });

    this.rewardText = this.add.text(16, 610, '', {
      fontSize: '17px',
      color: '#fff59d',
      fontStyle: 'bold',
      wordWrap: { width: width - 32 },
      lineSpacing: 4,
    });

    this.actionButton = this.add
      .rectangle(width / 2, height - 52, 240, 56, 0x1b5e20)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.actionButtonText = this.add
      .text(width / 2, height - 52, 'ANSWER ABOVE', {
        fontSize: '19px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.actionButton.on('pointerdown', () => {
      if (this.won && !this.finishTriggered) {
        this.finishTriggered = true;
        this.onWin();
      }
    });

    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      );
    }

    this.startNextRound();
    this.render();
  }

  update() {
    if (
      this.spaceKey &&
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.won &&
      !this.finishTriggered
    ) {
      this.finishTriggered = true;
      this.onWin();
    }
  }

  addMoreMovesToScene(newMoves: number) {
    this.credits += newMoves;
    this.maxCredits = Math.max(this.maxCredits, this.credits);
    this.render();
  }

  private drawBackground(width: number, height: number) {
    const g = this.add.graphics();
    g.fillStyle(0x0d2b2a, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x1f5550, 0.34);
    for (let x = 22; x < width; x += 52) {
      g.fillCircle(x, 96 + ((x / 52) % 2) * 12, 16);
    }

    g.lineStyle(2, 0x2b7a72, 0.3);
    for (let y = 148; y < height; y += 34) {
      g.strokeLineShape(new Phaser.Geom.Line(0, y, width, y));
    }
  }

  private createAnswerButtons(width: number) {
    const startY = 340;
    const spacingY = 56;

    for (let index = 0; index < 4; index += 1) {
      const box = this.add
        .rectangle(width / 2, startY + index * spacingY, width - 80, 44, 0x2a9d8f)
        .setStrokeStyle(2, 0xffffff, 0.7)
        .setRounded(10)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(width / 2, startY + index * spacingY, '0', {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const buttonRef = { box, label, value: 0 };
      box.on('pointerdown', () => this.handleAnswer(buttonRef.value));

      this.answerButtons.push(buttonRef);
    }
  }

  private startNextRound() {
    const chipType = Phaser.Utils.Array.GetRandom(CHIP_TYPES);
    const chipCount = Phaser.Math.Between(2, 7);
    const action = Phaser.Math.Between(0, 1) === 0 ? 'buy-in' : 'cash out';
    const correct = chipType.value * chipCount;

    const offsets = [
      -chipType.value,
      chipType.value,
      chipType.value * 2,
      -chipType.value * 2,
      15,
      -15,
      20,
      -20,
    ];

    const optionSet = new Set<number>([correct]);
    while (optionSet.size < 4) {
      const delta = Phaser.Utils.Array.GetRandom(offsets);
      const candidate = Math.max(5, correct + delta);
      if (candidate !== correct) {
        optionSet.add(candidate);
      }
    }

    const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

    this.currentRound = {
      prompt: `You ${action} ${chipCount} ${chipType.name} chip${chipCount === 1 ? '' : 's'
        } (${chipType.value} each). What is the total value?`,
      correct,
      options,
      chipCount,
    };

    this.promptText.setText(this.currentRound.prompt);
    this.answerButtons.forEach((button, index) => {
      button.value = options[index];
      button.label.setText(`${options[index]} baht`);
      button.box.setFillStyle(0x2a9d8f);
      button.box.setAlpha(1);
    });
  }

  private handleAnswer(selectedValue: number) {
    if (!this.currentRound || this.isResolving || this.won) return;

    if (this.credits <= 0) {
      this.onNoMoves();
      return;
    }

    this.isResolving = true;
    this.credits -= 1;

    const isCorrect = selectedValue === this.currentRound.correct;
    this.answerButtons.forEach((button) => {
      if (button.value === this.currentRound?.correct) {
        button.box.setFillStyle(0x2b9348);
      } else if (button.value === selectedValue) {
        button.box.setFillStyle(0xbe123c);
      }
      button.box.setAlpha(0.92);
    });

    this.animateChipExchange(this.currentRound.chipCount, isCorrect);

    if (isCorrect) {
      this.wins += 1;
      this.credits += 1;
      this.resultText.setText(`Correct! ${selectedValue} is the right total.`);
      this.rewardText.setText(
        `Great cashier math. Bonus +1 credit.\nWins: ${this.wins}/${this.targetWins}`,
      );
      this.playWinSound(this.wins >= this.targetWins);
    } else {
      this.resultText.setText(
        `Not quite. Correct total is ${this.currentRound.correct}.`,
      );
      this.rewardText.setText(
        `Try the next customer request.\nWins: ${this.wins}/${this.targetWins}`,
      );
      this.playLoseSound();
    }

    if (this.wins >= this.targetWins) {
      this.won = true;
      this.rewardText.setText(
        `Lesson clear! You handled ${this.targetWins} cashier requests.\nPress FINISH LESSON to continue.`,
      );
      this.isResolving = false;
      this.render();
      return;
    }

    this.render();

    this.time.delayedCall(900, () => {
      this.isResolving = false;
      if (this.credits <= 0) {
        this.onNoMoves();
        return;
      }
      this.startNextRound();
      this.render();
    });
  }

  private animateChipExchange(chipCount: number, isCorrect: boolean) {
    const chipColor = isCorrect ? 0x2a9d8f : 0xe76f51;
    const fromX = 122;
    const toX = Number(this.sys.game.config.width) - 122;

    for (let index = 0; index < Math.min(6, chipCount); index += 1) {
      const y = 290 + index * 12;
      const chip = this.add.circle(fromX, y, 9, chipColor, 1);
      chip.setStrokeStyle(2, 0xf1faee);

      this.tweens.add({
        targets: chip,
        x: toX,
        y: y - 4,
        alpha: { from: 1, to: 0.2 },
        scaleX: { from: 1, to: 0.8 },
        scaleY: { from: 1, to: 0.8 },
        duration: 380 + index * 40,
        ease: 'Sine.easeOut',
        onComplete: () => chip.destroy(),
      });
    }
  }

  private getAudioContext() {
    if (typeof window === 'undefined') return null;
    const audioWindow = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
      __cashierAudioContext?: AudioContext;
    };
    const AudioCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioWindow.__cashierAudioContext) {
      audioWindow.__cashierAudioContext = new AudioCtor();
    }
    return audioWindow.__cashierAudioContext;
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

  private playWinSound(isBig: boolean) {
    const notes = isBig ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    notes.forEach((note, index) => {
      this.playTone(note, 0.16, 'triangle', 0.032, index * 0.08);
    });
  }

  private playLoseSound() {
    this.playTone(230, 0.14, 'sawtooth', 0.022, 0);
    this.playTone(180, 0.18, 'sawtooth', 0.018, 0.08);
  }

  private render() {
    this.creditsText.setText(`Credits: ${this.credits}`);
    this.goalText.setText(
      `Goal: Complete ${this.targetWins} correct cashier requests.`,
    );

    if (this.won) {
      this.actionButton.setFillStyle(0xd18d00);
      this.actionButtonText.setText('FINISH LESSON');
    } else if (this.isResolving) {
      this.actionButton.setFillStyle(0x616161);
      this.actionButtonText.setText('CHECKING...');
    } else {
      this.actionButton.setFillStyle(0x1b5e20);
      this.actionButtonText.setText('ANSWER ABOVE');
    }
  }
}
