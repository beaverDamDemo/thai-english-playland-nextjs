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

    graphics.lineStyle(8, 0x0f271f, 0.95);
    graphics.strokeRoundedRect(8, 8, width - 16, height - 16, 18);

    graphics.lineStyle(2, 0x4d8b74, 0.45);
    graphics.strokeRoundedRect(18, 18, width - 36, height - 36, 14);
  }

  private generateCard(): Card | null {
    if (this.deck.length === 0) {
      return null;
    }

    const drawIndex = Phaser.Math.Between(0, this.deck.length - 1);
    const [baseCard] = this.deck.splice(drawIndex, 1);

    const roll = Phaser.Math.Between(1, 100);
    const rarity: Rarity = roll <= 65 ? 'Common' : roll <= 92 ? 'Rare' : 'Epic';

    return {
      id: this.nextCardId++,
      rank: baseCard.rank,
      rankLabel: baseCard.rankLabel,
      suit: baseCard.suit,
      rarity,
    };
  }

  private sortCardsForDisplay() {
    const suitOrder: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };
    this.cards.sort((a, b) => {
      if (a.rank !== b.rank) return b.rank - a.rank;
      return suitOrder[a.suit] - suitOrder[b.suit];
    });
  }

  private evaluateBestHand(cards: Card[]): HandResult {
    if (cards.length < 5) {
      return { rankName: 'Not enough cards', isWinning: false, winningCardIds: [] };
    }

    const royal = this.findRoyalFlush(cards);
    if (royal.length) {
      return { rankName: 'Royal Flush', isWinning: true, winningCardIds: royal };
    }

    const straightFlush = this.findStraightFlush(cards);
    if (straightFlush.length) {
      return { rankName: 'Straight Flush', isWinning: true, winningCardIds: straightFlush };
    }

    const fourKind = this.findNOfKind(cards, 4);
    if (fourKind.length) {
      return { rankName: 'Four of a Kind', isWinning: true, winningCardIds: fourKind };
    }

    const fullHouse = this.findFullHouse(cards);
    if (fullHouse.length) {
      return { rankName: 'Full House', isWinning: true, winningCardIds: fullHouse };
    }

    const flush = this.findFlush(cards);
    if (flush.length) {
      return { rankName: 'Flush', isWinning: true, winningCardIds: flush };
    }

    const straight = this.findStraight(cards);
    if (straight.length) {
      return { rankName: 'Straight', isWinning: true, winningCardIds: straight };
    }

    const threeKind = this.findNOfKind(cards, 3);
    if (threeKind.length) {
      return { rankName: 'Three of a Kind', isWinning: true, winningCardIds: threeKind };
    }

    const pairCount = this.countPairs(cards);
    if (pairCount >= 2) {
      return { rankName: 'Two Pair', isWinning: false, winningCardIds: [] };
    }
    if (pairCount === 1) {
      return { rankName: 'One Pair', isWinning: false, winningCardIds: [] };
    }

    return { rankName: 'High Card', isWinning: false, winningCardIds: [] };
  }

  private findNOfKind(cards: Card[], n: number): number[] {
    const byRank = new Map<number, Card[]>();
    for (const card of cards) {
      const list = byRank.get(card.rank) ?? [];
      list.push(card);
      byRank.set(card.rank, list);
    }

    const ranks = [...byRank.keys()].sort((a, b) => b - a);
    for (const rank of ranks) {
      const list = byRank.get(rank) ?? [];
      if (list.length >= n) {
        return list.slice(0, n).map((c) => c.id);
      }
    }
    return [];
  }

  private findFullHouse(cards: Card[]): number[] {
    const byRank = new Map<number, Card[]>();
    for (const card of cards) {
      const list = byRank.get(card.rank) ?? [];
      list.push(card);
      byRank.set(card.rank, list);
    }

    const rankEntries = [...byRank.entries()].sort((a, b) => b[0] - a[0]);
    const triple = rankEntries.find(([, list]) => list.length >= 3);
    if (!triple) return [];

    const pair = rankEntries.find(([rank, list]) => rank !== triple[0] && list.length >= 2);
    if (!pair) return [];

    return [...triple[1].slice(0, 3), ...pair[1].slice(0, 2)].map((c) => c.id);
  }

  private findFlush(cards: Card[]): number[] {
    for (const suit of SUITS) {
      const suited = cards
        .filter((c) => c.suit === suit)
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 5);
      if (suited.length >= 5) {
        return suited.map((c) => c.id);
      }
    }
    return [];
  }

  private findStraight(cards: Card[]): number[] {
    return this.findStraightFromCards(cards);
  }

  private findStraightFlush(cards: Card[]): number[] {
    for (const suit of SUITS) {
      const suited = cards.filter((c) => c.suit === suit);
      const ids = this.findStraightFromCards(suited);
      if (ids.length) return ids;
    }
    return [];
  }

  private findRoyalFlush(cards: Card[]): number[] {
    const need = [10, 11, 12, 13, 14];

    for (const suit of SUITS) {
      const suited = cards.filter((c) => c.suit === suit);
      const byRank = new Map<number, Card[]>();
      for (const card of suited) {
        const list = byRank.get(card.rank) ?? [];
        list.push(card);
        byRank.set(card.rank, list);
      }
      if (need.every((rank) => (byRank.get(rank)?.length ?? 0) > 0)) {
        return need.map((rank) => (byRank.get(rank) ?? [])[0].id);
      }
    }
    return [];
  }

  private findStraightFromCards(cards: Card[]): number[] {
    const byRank = new Map<number, Card[]>();
    for (const card of cards) {
      const list = byRank.get(card.rank) ?? [];
      list.push(card);
      byRank.set(card.rank, list);
    }

    const unique = [...byRank.keys()].sort((a, b) => a - b);
    if (unique.includes(14)) {
      unique.unshift(1);
    }

    let streak: number[] = [];
    let best: number[] = [];

    for (let i = 0; i < unique.length; i++) {
      const current = unique[i];
      if (i === 0 || current === unique[i - 1] + 1) {
        streak.push(current);
      } else if (current !== unique[i - 1]) {
        streak = [current];
      }

      if (streak.length >= 5) {
        best = streak.slice(streak.length - 5);
      }
    }

    if (best.length < 5) return [];

    return best.map((rankValue) => {
      const normalized = rankValue === 1 ? 14 : rankValue;
      return (byRank.get(normalized) ?? [])[0].id;
    });
  }

  private countPairs(cards: Card[]): number {
    const rankCount = new Map<number, number>();
    for (const card of cards) {
      rankCount.set(card.rank, (rankCount.get(card.rank) ?? 0) + 1);
    }
    return [...rankCount.values()].filter((count) => count >= 2).length;
  }

  private getSuitSymbol(suit: Suit): string {
    if (suit === 'H') return '♥';
    if (suit === 'D') return '♦';
    if (suit === 'C') return '♣';
    return '♠';
  }

  private getSuitColor(suit: Suit): string {
    if (suit === 'H' || suit === 'D') return '#C62828';
    return '#1B1B1B';
  }

  private getRarityBorderColor(rarity: Rarity): number {
    if (rarity === 'Epic') return 0xab47bc;
    if (rarity === 'Rare') return 0x42a5f5;
    return 0xb0bec5;
  }

  private renderCreditIcons() {
    this.creditTokenVisuals.forEach((token) => token.destroy());
    this.creditTokenVisuals = [];

    const visibleTokens = Math.min(this.credits, 12);
    const startX = 112;
    const y = 62;
    const tokenW = 14;
    const tokenH = 8;
    const gap = 6;

    for (let i = 0; i < visibleTokens; i++) {
      const token = this.add
        .rectangle(startX + i * (tokenW + gap), y, tokenW, tokenH, 0xffd54f)
        .setOrigin(0, 0.5)
        .setStrokeStyle(1, 0xf57f17);
      this.creditTokenVisuals.push(token);
    }

  }

  private renderCardVisuals(winningCardIds: number[]) {
    this.cardVisuals.forEach((obj) => obj.destroy());
    this.cardVisuals = [];

    if (this.cards.length === 0) {
      const emptyText = this.add.text(16, 192, '(empty)', {
        fontSize: '16px',
        color: '#ffe9e9',
      });
      const holder = this.add.container(0, 0, [emptyText]);
      this.cardVisuals.push(holder);
      return;
    }

    const highlightSet = new Set(winningCardIds);

    const startX = 16;
    const startY = 192;
    const cardW = 60;
    const cardH = 84;
    const gapX = 8;
    const gapY = 10;
    const perRow = 7;

    this.cards.forEach((card, idx) => {
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      const isWinningCard = highlightSet.has(card.id);
      const borderColor = isWinningCard ? 0xffd54f : this.getRarityBorderColor(card.rarity);
      const bgColor = isWinningCard ? 0xfff8e1 : 0xffffff;
      const bg = this.add.rectangle(0, 0, cardW, cardH, bgColor).setOrigin(0);
      bg.setStrokeStyle(isWinningCard ? 4 : 3, borderColor);

      const rankTop = this.add.text(6, 4, card.rankLabel, {
        fontSize: '16px',
        color: this.getSuitColor(card.suit),
        fontStyle: 'bold',
      });

      const suitCenter = this.add
        .text(cardW / 2, cardH / 2 + 2, this.getSuitSymbol(card.suit), {
          fontSize: '28px',
          color: this.getSuitColor(card.suit),
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      const rankBottom = this.add
        .text(cardW - 6, cardH - 4, card.rankLabel, {
          fontSize: '14px',
          color: this.getSuitColor(card.suit),
          fontStyle: 'bold',
        })
        .setOrigin(1, 1);

      const rarityTag = this.add
        .text(cardW / 2, cardH + 2, card.rarity[0], {
          fontSize: '11px',
          color: '#ffffff',
          backgroundColor: '#' + this.getRarityBorderColor(card.rarity).toString(16).padStart(6, '0'),
          padding: { left: 4, right: 4, top: 1, bottom: 1 },
        })
        .setOrigin(0.5, 0);

      const winBadge = isWinningCard
        ? this.add
          .text(cardW / 2, -3, 'WIN', {
            fontSize: '10px',
            color: '#1B1B1B',
            backgroundColor: '#FFD54F',
            fontStyle: 'bold',
            padding: { left: 4, right: 4, top: 1, bottom: 1 },
          })
          .setOrigin(0.5, 1)
        : null;

      const children = [bg, rankTop, suitCenter, rankBottom, rarityTag];
      if (winBadge) children.push(winBadge);

      const cardContainer = this.add.container(x, y, children);
      this.cardVisuals.push(cardContainer);
    });
  }

  private render() {
    const best = this.evaluateBestHand(this.cards);
    const commonCount = this.cards.filter((c) => c.rarity === 'Common').length;
    const rareCount = this.cards.filter((c) => c.rarity === 'Rare').length;
    const epicCount = this.cards.filter((c) => c.rarity === 'Epic').length;

    this.renderCreditIcons();
    this.handText.setText(`Best Hand: ${best.rankName}`);

    this.cardsText.setText('Collection:');
    this.renderCardVisuals(best.winningCardIds);

    this.rarityText.setText(
      `Rarity: Common ${commonCount} | Rare ${rareCount} | Epic ${epicCount}`,
    );

    if (this.won) {
      this.actionButton.setFillStyle(0x1565c0);
      this.actionButtonText.setText('FINISH');
      this.rewardText.setText(`Winning hand: ${best.rankName}`);
    } else {
      if (this.credits <= 0) {
        this.actionButton.setFillStyle(0x5d4037);
        this.actionButtonText.setText('LOAD MORE QUESTIONS');
        this.rewardText.setText('Out of credits. Complete quiz questions to earn more draws.');
      } else {
        this.actionButton.setFillStyle(0x1b5e20);
        this.actionButtonText.setText('DRAW CARD');
        this.rewardText.setText('Win condition: Three of a Kind, Straight, Flush, or better.');
      }
    }
  }
}
