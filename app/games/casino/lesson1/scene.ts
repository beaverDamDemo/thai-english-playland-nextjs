import * as Phaser from 'phaser';

type Suit = 'H' | 'D' | 'C' | 'S';
type Rarity = 'Common' | 'Rare' | 'Epic';

type Card = {
  id: number;
  rank: number;
  rankLabel: string;
  suit: Suit;
  rarity: Rarity;
};

type DeckCard = {
  rank: number;
  rankLabel: string;
  suit: Suit;
};

type HandResult = {
  rankName: string;
  isWinning: boolean;
  winningCardIds: number[];
};

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Array<{ value: number; label: string; }> = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: 'J' },
  { value: 12, label: 'Q' },
  { value: 13, label: 'K' },
  { value: 14, label: 'A' },
];

export class MazeScene extends Phaser.Scene {
  credits!: number;
  maxCredits!: number;
  onNoMoves!: () => void;
  onWin!: () => void;

  titleText!: Phaser.GameObjects.Text;
  creditsLabel!: Phaser.GameObjects.Text;
  hintText!: Phaser.GameObjects.Text;
  handText!: Phaser.GameObjects.Text;
  cardsText!: Phaser.GameObjects.Text;
  rarityText!: Phaser.GameObjects.Text;
  rewardText!: Phaser.GameObjects.Text;

  actionButton!: Phaser.GameObjects.Rectangle;
  actionButtonText!: Phaser.GameObjects.Text;

  cardVisuals: Phaser.GameObjects.Container[] = [];
  creditTokenVisuals: Phaser.GameObjects.Rectangle[] = [];
  cards: Card[] = [];
  deck: DeckCard[] = [];
  won = false;
  finishTriggered = false;
  nextCardId = 1;

  spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('MazeScene');
  }

  create() {
    this.maxCredits = this.registry.get('maxMoves') ?? 0;
    this.credits = this.maxCredits;
    this.deck = this.buildDeck();
    this.onNoMoves = this.registry.get('onNoMoves') || (() => { });
    this.onWin = this.registry.get('onWin') || (() => { });

    const width = Number(this.sys.game.config.width);
    const height = Number(this.sys.game.config.height);

    this.drawBackgroundPattern(width, height);

    this.titleText = this.add.text(16, 14, 'POKER CARD COLLECTION', {
      fontSize: '26px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.creditsLabel = this.add.text(16, 52, 'Credits', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.hintText = this.add.text(16, 86, '', {
      fontSize: '15px',
      color: '#ffe9e9',
    });

    this.actionButton = this.add
      .rectangle(width / 2, height - 38, 210, 52, 0x1b5e20)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.actionButtonText = this.add
      .text(width / 2, height - 38, 'DRAW CARD', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.actionButton.on('pointerdown', () => this.handleActionButton());
    this.actionButton.on('pointerover', () => {
      this.actionButton.setFillStyle(this.won ? 0x1976d2 : 0x2e7d32);
    });
    this.actionButton.on('pointerout', () => {
      this.actionButton.setFillStyle(this.won ? 0x1565c0 : 0x1b5e20);
    });

    this.handText = this.add.text(16, 122, 'Best Hand: Not enough cards', {
      fontSize: '18px',
      color: '#fff6b0',
      fontStyle: 'bold',
    });

    this.cardsText = this.add.text(16, 160, 'Collection:', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    this.rarityText = this.add.text(16, 470, 'Rarity: Common 0 | Rare 0 | Epic 0', {
      fontSize: '16px',
      color: '#fff',
    });

    this.rewardText = this.add.text(16, 510, '', {
      fontSize: '18px',
      color: '#fff59d',
      fontStyle: 'bold',
      wordWrap: { width: width - 32 },
      lineSpacing: 6,
    });

    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.render();
  }

  update() {
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleActionButton();
    }
  }

  addMoreMovesToScene(newMoves: number) {
    this.credits += newMoves;
    this.maxCredits = Math.max(this.maxCredits, this.credits);
    this.render();
  }

  private handleActionButton() {
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

    this.drawCard();
  }

  private drawCard() {
    if (this.credits <= 0) {
      this.onNoMoves();
      return;
    }

    this.credits -= 1;
    const nextCard = this.generateCard();
    if (!nextCard) {
      this.rewardText.setText('Deck is empty. No duplicate cards are allowed.');
      this.render();
      return;
    }

    this.cards.push(nextCard);
    this.sortCardsForDisplay();

    if (this.cards.length > 14) {
      this.cards = this.cards.slice(this.cards.length - 14);
    }

    const bestHand = this.evaluateBestHand(this.cards);

    if (bestHand.isWinning) {
      this.won = true;
    } else if (this.credits <= 0) {
      this.onNoMoves();
    }

    this.render();
  }

  private buildDeck(): DeckCard[] {
    const cards: DeckCard[] = [];
    for (const rank of RANKS) {
      for (const suit of SUITS) {
        cards.push({
          rank: rank.value,
          rankLabel: rank.label,
          suit,
        });
      }
    }
    return cards;
  }

  private drawBackgroundPattern(width: number, height: number) {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x16382c, 1);
    graphics.fillRect(0, 0, width, height);

    graphics.lineStyle(1, 0x2f6a57, 0.42);
    for (let x = -24; x < width + 24; x += 32) {
      for (let y = 110; y < height; y += 32) {
        graphics.strokePoints(
          [
            new Phaser.Geom.Point(x + 16, y),
            new Phaser.Geom.Point(x + 32, y + 16),
            new Phaser.Geom.Point(x + 16, y + 32),
            new Phaser.Geom.Point(x, y + 16),
          ],
          true,
        );
      }
    }

    graphics.fillStyle(0x214d3c, 0.35);
    for (let x = -16; x < width + 16; x += 64) {
      for (let y = 126; y < height; y += 64) {
        graphics.fillPoints(
          [
            new Phaser.Geom.Point(x + 16, y),
            new Phaser.Geom.Point(x + 32, y + 16),
            new Phaser.Geom.Point(x + 16, y + 32),
            new Phaser.Geom.Point(x, y + 16),
          ],
          true,
        );
      }
    }
  }

  private generateCard(): Card | null {
    const usedKeys = new Set(this.cards.map((card) => `${card.rank}-${card.suit}`));
    const available = this.deck.filter(
      (card) => !usedKeys.has(`${card.rank}-${card.suit}`),
    );

    if (available.length === 0) {
      return null;
    }

    const pick = Phaser.Utils.Array.GetRandom(available);
    const rarity = this.rollRarity();

    return {
      id: this.nextCardId++,
      rank: pick.rank,
      rankLabel: pick.rankLabel,
      suit: pick.suit,
      rarity,
    };
  }

  private rollRarity(): Rarity {
    const roll = Math.random();
    if (roll < 0.08) return 'Epic';
    if (roll < 0.33) return 'Rare';
    return 'Common';
  }

  private sortCardsForDisplay() {
    this.cards.sort((a, b) => {
      if (a.rank !== b.rank) return b.rank - a.rank;
      return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    });
  }

  private evaluateBestHand(cards: Card[]): HandResult {
    if (cards.length < 5) {
      return { rankName: 'Not enough cards', isWinning: false, winningCardIds: [] };
    }

    const cardsByRank = new Map<number, Card[]>();
    const cardsBySuit = new Map<Suit, Card[]>();

    for (const card of cards) {
      if (!cardsByRank.has(card.rank)) cardsByRank.set(card.rank, []);
      cardsByRank.get(card.rank)?.push(card);

      if (!cardsBySuit.has(card.suit)) cardsBySuit.set(card.suit, []);
      cardsBySuit.get(card.suit)?.push(card);
    }

    const flushSuit = Array.from(cardsBySuit.entries()).find(([, suitCards]) => suitCards.length >= 5);
    if (flushSuit) {
      return {
        rankName: `Flush (${flushSuit[0]})`,
        isWinning: true,
        winningCardIds: flushSuit[1].slice(0, 5).map((card) => card.id),
      };
    }

    const triples = Array.from(cardsByRank.values()).filter((group) => group.length >= 3);
    if (triples.length > 0) {
      return {
        rankName: 'Three of a Kind',
        isWinning: true,
        winningCardIds: triples[0].slice(0, 3).map((card) => card.id),
      };
    }

    const pairs = Array.from(cardsByRank.values()).filter((group) => group.length >= 2);
    if (pairs.length >= 2) {
      return {
        rankName: 'Two Pair',
        isWinning: true,
        winningCardIds: pairs
          .slice(0, 2)
          .flatMap((group) => group.slice(0, 2).map((card) => card.id)),
      };
    }

    return { rankName: 'High Card', isWinning: false, winningCardIds: [] };
  }

  private render() {
    this.creditsLabel.setText(`Credits: ${this.credits}`);

    const result = this.evaluateBestHand(this.cards);
    this.handText.setText(`Best Hand: ${result.rankName}`);
    this.hintText.setText(
      this.won
        ? 'You built a winning collection. Tap DRAW CARD again to finish.'
        : this.credits > 0
          ? 'Spend credits to draw unique cards and build a strong hand.'
          : 'No credits left. Complete the quiz to earn more.',
    );

    this.rewardText.setText(
      this.won
        ? 'Winning hand achieved! Press DRAW CARD one more time to complete the lesson.'
        : `Need a winning hand before credits run out. Cards collected: ${this.cards.length}`,
    );

    const rareCount = this.cards.filter((card) => card.rarity === 'Rare').length;
    const epicCount = this.cards.filter((card) => card.rarity === 'Epic').length;
    const commonCount = this.cards.filter((card) => card.rarity === 'Common').length;
    this.rarityText.setText(
      `Rarity: Common ${commonCount} | Rare ${rareCount} | Epic ${epicCount}`,
    );

    this.actionButtonText.setText(this.won ? 'FINISH LESSON' : 'DRAW CARD');

    this.renderCards(result.winningCardIds);
    this.renderCreditTokens();
  }

  private renderCards(winningCardIds: number[]) {
    this.cardVisuals.forEach((card) => card.destroy());
    this.cardVisuals = [];

    const startX = 18;
    const startY = 208;
    const columns = 4;
    const cardWidth = 108;
    const cardHeight = 116;
    const gapX = 12;
    const gapY = 14;

    this.cards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);
      const highlight = winningCardIds.includes(card.id);

      const container = this.add.container(x, y);
      const bg = this.add
        .rectangle(0, 0, cardWidth, cardHeight, highlight ? 0xfff8d6 : 0xffffff)
        .setOrigin(0)
        .setStrokeStyle(3, highlight ? 0xffca28 : 0x1b5e20);
      const rank = this.add.text(12, 10, `${card.rankLabel}${card.suit}`, {
        fontSize: '24px',
        color: card.suit === 'H' || card.suit === 'D' ? '#c62828' : '#263238',
        fontStyle: 'bold',
      });
      const rarity = this.add.text(12, 76, card.rarity, {
        fontSize: '18px',
        color:
          card.rarity === 'Epic'
            ? '#7b1fa2'
            : card.rarity === 'Rare'
              ? '#1565c0'
              : '#2e7d32',
        fontStyle: 'bold',
      });

      container.add([bg, rank, rarity]);
      this.cardVisuals.push(container);
    });
  }

  private renderCreditTokens() {
    this.creditTokenVisuals.forEach((token) => token.destroy());
    this.creditTokenVisuals = [];

    const tokenSize = 16;
    const gap = 8;
    const startX = 130;
    const y = 58;

    for (let index = 0; index < Math.min(this.credits, 18); index += 1) {
      const token = this.add.rectangle(
        startX + index * (tokenSize + gap),
        y,
        tokenSize,
        tokenSize,
        0xffd54f,
      );
      token.setStrokeStyle(2, 0xffffff, 0.7);
      this.creditTokenVisuals.push(token);
    }
  }
}