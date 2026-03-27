import * as Phaser from 'phaser';

type ReelSymbol = 'CHERRY' | 'BELL' | 'STAR' | 'BAR' | 'SEVEN';

type ReelVisual = {
  frame: Phaser.GameObjects.Container;
  symbols: Phaser.GameObjects.Text[];
  x: number;
};

const SYMBOLS: Array<{ key: ReelSymbol; icon: string; name: string; }> = [
  { key: 'CHERRY', icon: '🍒', name: 'Cherry' },
  { key: 'BELL', icon: '🔔', name: 'Bell' },
  { key: 'STAR', icon: '⭐', name: 'Star' },
  { key: 'BAR', icon: '🟦', name: 'Bar' },
  { key: 'SEVEN', icon: '7️⃣', name: 'Seven' },
];

export class MazeScene extends Phaser.Scene {
  credits!: number;
  maxCredits!: number;
  onNoMoves!: () => void;
  onWin!: () => void;

  titleText!: Phaser.GameObjects.Text;
  creditsText!: Phaser.GameObjects.Text;
  goalText!: Phaser.GameObjects.Text;
  helpText!: Phaser.GameObjects.Text;
  resultText!: Phaser.GameObjects.Text;
  rewardText!: Phaser.GameObjects.Text;
  selectedLineText!: Phaser.GameObjects.Text;

  spinButton!: Phaser.GameObjects.Rectangle;
  spinButtonText!: Phaser.GameObjects.Text;
  machineGlow!: Phaser.GameObjects.Rectangle;
  paylineGlow!: Phaser.GameObjects.Rectangle;
  reelVisuals: ReelVisual[] = [];

  wins = 0;
  targetWins = 3;
  won = false;
  finishTriggered = false;
  isSpinning = false;

  spinLoops: Phaser.Time.TimerEvent[] = [];
  spinEndEvents: Phaser.Time.TimerEvent[] = [];

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

    this.titleText = this.add.text(16, 16, 'SLOT MACHINE ENGLISH', {
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

    this.helpText = this.add.text(
      16,
      116,
      'Spin the reels. Three matching center symbols = line win.\nThree line wins clears the lesson. Matching 7s pays extra credits.',
      {
        fontSize: '15px',
        color: '#f7f2f2',
        lineSpacing: 4,
      },
    );

    this.createSlotMachine(width / 2, 325);

    this.selectedLineText = this.add.text(16, 520, 'Active line: middle row', {
      fontSize: '17px',
      color: '#fff6b0',
      fontStyle: 'bold',
    });

    this.resultText = this.add.text(16, 552, 'Spin the machine to see the result.', {
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

    this.spinButton = this.add
      .rectangle(width / 2, height - 52, 220, 56, 0x6a1b9a)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.spinButtonText = this.add
      .text(width / 2, height - 52, 'SPIN SLOTS', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.spinButton.on('pointerdown', () => this.handleSpinPress());
    this.spinButton.on('pointerover', () => {
      this.spinButton.setFillStyle(this.won ? 0xf0a500 : 0x7b1fa2);
    });
    this.spinButton.on('pointerout', () => {
      this.spinButton.setFillStyle(this.won ? 0xd18d00 : 0x6a1b9a);
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

    g.fillStyle(0x140b23, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x2d1344, 0.42);
    for (let i = 0; i < 10; i += 1) {
      g.fillCircle(34 + i * 48, 92 + (i % 2 === 0 ? 0 : 14), 22);
    }

    g.lineStyle(2, 0x4b1f73, 0.42);
    for (let y = 148; y < height; y += 36) {
      g.strokeLineShape(new Phaser.Geom.Line(0, y, width, y));
    }
  }

  private createSlotMachine(centerX: number, centerY: number) {
    const body = this.add.rectangle(centerX, centerY, 380, 250, 0x2b1840, 1);
    body.setStrokeStyle(6, 0xf4d58d);
    body.setRounded(22);

    this.machineGlow = this.add.rectangle(centerX, centerY, 388, 258, 0xffdf91, 0.08);
    this.machineGlow.setStrokeStyle(2, 0xffe8b5, 0.35);
    this.machineGlow.setRounded(24);

    this.add.rectangle(centerX, centerY - 86, 308, 34, 0x56306e, 1).setStrokeStyle(2, 0xffffff, 0.3);
    this.add.text(centerX, centerY - 86, 'LUCKY ENGLISH SLOTS', {
      fontSize: '18px',
      color: '#fff7d6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.paylineGlow = this.add.rectangle(centerX, centerY, 294, 66, 0xffe066, 0.1);
    this.paylineGlow.setStrokeStyle(3, 0xffe066, 0.9);

    const reelXs = [centerX - 98, centerX, centerX + 98];
    reelXs.forEach((x) => {
      const frame = this.add.container(x, centerY);
      const frameBg = this.add.rectangle(0, 0, 86, 150, 0xf6f1ff, 1);
      frameBg.setStrokeStyle(4, 0x8f7db0);
      frameBg.setRounded(14);
      frame.add(frameBg);

      const symbols = [-44, 0, 44].map((yOffset) => {
        const text = this.add.text(0, yOffset, this.getRandomSymbol().icon, {
          fontSize: '31px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
        }).setOrigin(0.5);
        frame.add(text);
        return text;
      });

      this.reelVisuals.push({ frame, symbols, x });
    });

    this.add.rectangle(centerX, centerY, 312, 2, 0xffe066, 1);

    const leverTrack = this.add.rectangle(centerX + 170, centerY - 24, 10, 118, 0x8e8e8e, 1);
    leverTrack.setStrokeStyle(2, 0xdadada);
    const leverBall = this.add.circle(centerX + 170, centerY + 42, 18, 0xff595e, 1);
    leverBall.setStrokeStyle(3, 0xffd6d6);
    this.tweens.add({
      targets: leverBall,
      y: centerY + 52,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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

    this.startSpin();
  }

  private startSpin() {
    this.isSpinning = true;
    this.credits -= 1;
    this.clearPendingSpinEvents();
    this.resultText.setText('Reels spinning...');
    this.rewardText.setText('Watch the middle payline.');
    this.playSpinSounds();

    this.tweens.add({
      targets: this.machineGlow,
      alpha: { from: 0.1, to: 0.26 },
      duration: 220,
      yoyo: true,
      repeat: 4,
    });

    const finalSymbols = [this.getRandomSymbol(), this.getRandomSymbol(), this.getRandomSymbol()];
    const shouldForceWin = Phaser.Math.Between(0, 100) < 28;
    if (shouldForceWin) {
      const forced = this.getRandomSymbol();
      finalSymbols[0] = forced;
      finalSymbols[1] = forced;
      finalSymbols[2] = forced;
    }

    this.reelVisuals.forEach((reel, index) => {
      const loop = this.time.addEvent({
        delay: 90,
        loop: true,
        callback: () => this.shuffleReelSymbols(reel),
      });
      this.spinLoops.push(loop);

      const stopEvent = this.time.delayedCall(850 + index * 360, () => {
        loop.remove(false);
        this.stopReelAtSymbol(reel, finalSymbols[index]);

        if (index === this.reelVisuals.length - 1) {
          this.finishSpin(finalSymbols.map((symbol) => symbol.key));
        }
      });
      this.spinEndEvents.push(stopEvent);
    });

    this.render();
  }

  private shuffleReelSymbols(reel: ReelVisual) {
    reel.symbols.forEach((symbolText) => {
      const next = this.getRandomSymbol();
      symbolText.setText(next.icon);
      symbolText.setColor('#ffffff');
    });
  }

  private stopReelAtSymbol(
    reel: ReelVisual,
    target: { key: ReelSymbol; icon: string; name: string; },
  ) {
    const top = this.getRandomSymbol();
    const bottom = this.getRandomSymbol();
    reel.symbols[0].setText(top.icon).setColor('#ffffff');
    reel.symbols[1].setText(target.icon).setColor('#ffffff');
    reel.symbols[2].setText(bottom.icon).setColor('#ffffff');

    this.tweens.add({
      targets: reel.frame,
      y: reel.frame.y + 6,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private finishSpin(centerLine: ReelSymbol[]) {
    const [left, middle, right] = centerLine;
    const isJackpot = left === middle && middle === right;
    const isNearWin = left === middle || middle === right || left === right;
    const lineIcons = `${this.getSymbolByKey(left).icon} | ${this.getSymbolByKey(middle).icon} | ${this.getSymbolByKey(right).icon}`;

    this.isSpinning = false;

    if (isJackpot) {
      this.wins += 1;
      const jackpotBonus = left === 'SEVEN' ? 3 : 2;
      this.credits += jackpotBonus;
      this.resultText.setText(`PAYLINE: ${lineIcons}`);
      this.rewardText.setText(
        `Line win! Three matching ${this.getSymbolByKey(middle).name} symbols. Bonus +${jackpotBonus} credits.\nWins: ${this.wins}/${this.targetWins}`,
      );
      this.playWinSound(left === 'SEVEN');
      this.flashPayline(0x9cffd0);
    } else if (isNearWin) {
      this.credits += 1;
      this.resultText.setText(`PAYLINE: ${lineIcons}`);
      this.rewardText.setText(
        `Two symbols matched. Small bonus +1 credit.\nWins: ${this.wins}/${this.targetWins}`,
      );
      this.playNearWinSound();
      this.flashPayline(0xffe59a);
    } else {
      this.resultText.setText(`PAYLINE: ${lineIcons}`);
      this.rewardText.setText(
        `No line win this time. Try another spin.\nWins: ${this.wins}/${this.targetWins}`,
      );
      this.playLoseSound();
      this.flashPayline(0xff9aa2);
    }

    if (this.wins >= this.targetWins) {
      this.won = true;
      this.rewardText.setText(
        `Jackpot lesson clear! You reached ${this.targetWins} line wins.\nPress SPIN SLOTS again to finish lesson.`,
      );
    } else if (this.credits <= 0) {
      this.onNoMoves();
    }

    this.render();
  }

  private flashPayline(color: number) {
    this.paylineGlow.setFillStyle(color, 0.16);
    this.paylineGlow.setStrokeStyle(3, color, 1);
    this.tweens.add({
      targets: this.paylineGlow,
      alpha: { from: 1, to: 0.45 },
      duration: 220,
      yoyo: true,
      repeat: 3,
    });
  }

  private clearPendingSpinEvents() {
    this.spinLoops.forEach((event) => event.remove(false));
    this.spinEndEvents.forEach((event) => event.remove(false));
    this.spinLoops = [];
    this.spinEndEvents = [];
  }

  private getRandomSymbol() {
    return Phaser.Utils.Array.GetRandom(SYMBOLS);
  }

  private getSymbolByKey(key: ReelSymbol) {
    return SYMBOLS.find((symbol) => symbol.key === key) ?? SYMBOLS[0];
  }

  private getAudioContext() {
    if (typeof window === 'undefined') return null;
    const audioWindow = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
      __slotAudioContext?: AudioContext;
    };
    const AudioCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioWindow.__slotAudioContext) {
      audioWindow.__slotAudioContext = new AudioCtor();
    }
    return audioWindow.__slotAudioContext;
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
    for (let index = 0; index < 12; index += 1) {
      this.playTone(540 + index * 12, 0.045, 'square', 0.015, index * 0.1);
    }
  }

  private playWinSound(bigWin: boolean) {
    const notes = bigWin
      ? [523.25, 659.25, 783.99, 1046.5]
      : [523.25, 659.25, 783.99];
    notes.forEach((note, index) => {
      this.playTone(note, 0.18, 'triangle', 0.035, index * 0.08);
    });
  }

  private playNearWinSound() {
    [440, 554.37].forEach((note, index) => {
      this.playTone(note, 0.14, 'triangle', 0.024, index * 0.07);
    });
  }

  private playLoseSound() {
    this.playTone(250, 0.14, 'sawtooth', 0.026, 0);
    this.playTone(200, 0.18, 'sawtooth', 0.02, 0.07);
  }

  private render() {
    this.creditsText.setText(`Credits: ${this.credits}`);
    this.goalText.setText(
      `Goal: Reach ${this.targetWins} line wins to clear the lesson.`,
    );

    if (this.isSpinning) {
      this.spinButton.setFillStyle(0x616161);
      this.spinButtonText.setText('SPINNING...');
    } else if (this.won) {
      this.spinButton.setFillStyle(0xd18d00);
      this.spinButtonText.setText('FINISH LESSON');
    } else {
      this.spinButton.setFillStyle(0x6a1b9a);
      this.spinButtonText.setText('SPIN SLOTS');
    }
  }
}
