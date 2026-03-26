import Phaser from 'phaser';
import { memoryThemes } from '../games/memory/themes';

export default class MemoryGameScene extends Phaser.Scene {
  constructor() {
    super('MemoryGame');

    this.sceneObjects = [];
    this.cards = [];
    this.selectedCards = [];
    this.currentTheme = null;
    this.totalPairs = 0;
    this.matchedPairs = 0;
    this.inputLocked = false;
    this.statusText = null;
    this.themeKey = '';
    this.requestedPairCount = 8;
    this.completed = false;
    this.waitingForDialog = false;
    this.onDialogClosedHandler = null;
  }

  init(data) {
    this.themeKey = data?.themeKey ?? '';
    this.requestedPairCount = Number(data?.pairCount ?? 8);
    this.sceneObjects = [];
    this.cards = [];
    this.selectedCards = [];
    this.currentTheme = null;
    this.totalPairs = 0;
    this.matchedPairs = 0;
    this.inputLocked = false;
    this.statusText = null;
    this.completed = false;
    this.waitingForDialog = false;
    this.onDialogClosedHandler = null;
  }

  create() {
    this.events.once('shutdown', this.onShutdown, this);

    const theme = memoryThemes.find((entry) => entry.key === this.themeKey);
    if (!theme) {
      this.emitExit('themes', 'error');
      return;
    }

    this.currentTheme = theme;
    this.totalPairs = this.resolvePairCount(theme.cards.length, this.requestedPairCount);
    if (this.totalPairs <= 0) {
      this.emitExit('themes', 'error');
      return;
    }
    this.completed = false;
    this.waitingForDialog = false;
    this.onDialogClosedHandler = () => this.handleDialogClosed();
    this.game.events.on('memoryDialogClosed', this.onDialogClosedHandler);

    const { width, height } = this.scale;
    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfefae0);
    this.add.rectangle(width * 0.5, height * 0.72, width, height * 0.5, 0xade8f4, 0.35);

    const selectedCards = Phaser.Utils.Array.Shuffle([...theme.cards]).slice(0, this.totalPairs);
    const deck = [];
    selectedCards.forEach((card) => {
      const cardData = {
        pairId: card.id,
        textureKey: card.key,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl
      };
      deck.push(cardData);
      deck.push({ ...cardData });
    });
    Phaser.Utils.Array.Shuffle(deck);

    const { cols, rows } = this.getGridFor(deck.length);
    const isDesktop = width >= 1100;
    const isWideBoard = cols >= 8;
    const boardGrowth = Phaser.Math.Clamp((deck.length - 16) / 16, 0, 1);
    const titleY = isWideBoard
      ? isDesktop
        ? 20
        : 24
      : isDesktop
        ? Phaser.Math.Linear(30, 24, boardGrowth)
        : Phaser.Math.Linear(32, 26, boardGrowth);
    const statusY = isWideBoard
      ? isDesktop
        ? 44
        : 50
      : isDesktop
        ? Phaser.Math.Linear(58, 48, boardGrowth)
        : Phaser.Math.Linear(60, 52, boardGrowth);
    const titleSize = isWideBoard
      ? isDesktop
        ? 30
        : 32
      : isDesktop
        ? Phaser.Math.Linear(38, 34, boardGrowth)
        : Phaser.Math.Linear(38, 35, boardGrowth);
    const statusSize = isWideBoard
      ? isDesktop
        ? 18
        : 19
      : isDesktop
        ? Phaser.Math.Linear(23, 20, boardGrowth)
        : Phaser.Math.Linear(23, 21, boardGrowth);

    const title = this.add
      .text(width * 0.5, titleY, `Memory - ${theme.name}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: `${titleSize}px`,
        color: '#264653',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(title);

    this.statusText = this.add
      .text(width * 0.5, statusY, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: `${statusSize}px`,
        color: '#1d3557'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.statusText);
    this.updateStatus();

    const gap = isWideBoard
      ? isDesktop
        ? 6
        : 6
      : isDesktop
        ? Phaser.Math.Linear(10, 8, boardGrowth)
        : Phaser.Math.Linear(10, 9, boardGrowth);
    const aspectRatio = isWideBoard
      ? isDesktop
        ? 0.82
        : 0.9
      : isDesktop
        ? Phaser.Math.Linear(0.96, 0.92, boardGrowth)
        : Phaser.Math.Linear(1.08, 1.02, boardGrowth);
    const availableWidth = width * (isWideBoard ? (isDesktop ? 0.992 : 0.985) : isDesktop ? 0.985 : 0.96);
    const boardTop = statusY + (isWideBoard ? (isDesktop ? 10 : 14) : isDesktop ? 14 : 18);
    const bottomPadding = isWideBoard ? (isDesktop ? 10 : 14) : isDesktop ? 14 : 18;
    const availableHeight = height - boardTop - bottomPadding;
    let cardWidth = (availableWidth - (cols - 1) * gap) / cols;
    let cardHeight = cardWidth * aspectRatio;

    if (cardHeight * rows + (rows - 1) * gap > availableHeight) {
      cardHeight = (availableHeight - (rows - 1) * gap) / rows;
      cardWidth = cardHeight / aspectRatio;
    }

    const boardWidth = cols * cardWidth + (cols - 1) * gap;
    const startX = width * 0.5 - boardWidth * 0.5 + cardWidth * 0.5;
    const startY = boardTop + cardHeight * 0.5;

    deck.forEach((entry, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);
      const card = this.createMemoryCard({ x, y, width: cardWidth, height: cardHeight, entry });
      this.cards.push(card);
      this.sceneObjects.push(card.container);
    });
  }

  resolvePairCount(maxPairs, requestedPairCount) {
    const roundedMax = Math.floor(maxPairs / 4) * 4;
    const maxAllowed = roundedMax >= 8 ? roundedMax : maxPairs;
    if (maxAllowed <= 0) {
      return 0;
    }
    const parsed = Number(requestedPairCount);
    const minAllowed = maxAllowed >= 8 ? 8 : maxAllowed;
    const safeRequested = Number.isFinite(parsed) ? parsed : minAllowed;
    const capped = Math.min(maxAllowed, Math.max(minAllowed, safeRequested));
    return maxAllowed >= 8 ? Math.floor(capped / 4) * 4 : maxAllowed;
  }

  onShutdown() {
    if (this.onDialogClosedHandler) {
      this.game.events.off('memoryDialogClosed', this.onDialogClosedHandler);
      this.onDialogClosedHandler = null;
    }
    this.clearObjects(this.sceneObjects);
    this.cards = [];
    this.selectedCards = [];
    this.waitingForDialog = false;
  }

  getGridFor(totalCards) {
    if (totalCards <= 16) {
      return { cols: 4, rows: Math.ceil(totalCards / 4) };
    }

    if (totalCards <= 20) {
      return { cols: 5, rows: Math.ceil(totalCards / 5) };
    }

    if (totalCards <= 24) {
      return { cols: 6, rows: Math.ceil(totalCards / 6) };
    }

    if (totalCards <= 32) {
      return { cols: 8, rows: Math.ceil(totalCards / 8) };
    }

    if (totalCards <= 40) {
      return { cols: 8, rows: Math.ceil(totalCards / 8) };
    }

    return { cols: 6, rows: Math.ceil(totalCards / 6) };
  }

  createMemoryCard({ x, y, width, height, entry }) {
    const shadow = this.add.rectangle(4, 6, width, height, 0x000000, 0.15);
    const frame = this.add.rectangle(0, 0, width, height, 0xffffff, 0.96).setStrokeStyle(2, 0xadb5bd, 0.9);
    const front = this.add.image(0, 0, entry.textureKey).setDisplaySize(width - 10, height - 10).setVisible(false);
    const back = this.add.image(0, 0, 'memory-card-back').setDisplaySize(width - 10, height - 10).setVisible(true);

    const container = this.add.container(x, y, [shadow, frame, front, back]);
    container.setSize(width, height);
    frame.setInteractive({ cursor: 'pointer' });

    const card = {
      pairId: entry.pairId,
      title: entry.title,
      description: entry.description,
      imageUrl: entry.imageUrl,
      state: 'hidden',
      container,
      hitPanel: frame,
      front,
      back,
      frame
    };

    frame.on('pointerup', () => this.handleCardClick(card));

    return card;
  }

  handleCardClick(card) {
    if (this.inputLocked || card.state !== 'hidden' || this.completed) {
      return;
    }

    this.inputLocked = true;
    this.flipCard(card, true, () => {
      card.state = 'revealed';
      this.selectedCards.push(card);

      if (this.selectedCards.length < 2) {
        this.inputLocked = false;
        return;
      }

      const [first, second] = this.selectedCards;
      if (first.pairId === second.pairId) {
        first.state = 'matched';
        second.state = 'matched';
        first.hitPanel.disableInteractive();
        second.hitPanel.disableInteractive();
        first.frame.setStrokeStyle(3, 0x2a9d8f, 1);
        second.frame.setStrokeStyle(3, 0x2a9d8f, 1);

        this.selectedCards = [];
        this.matchedPairs += 1;
        this.updateStatus();
        this.completed = this.matchedPairs === this.totalPairs;
        this.waitingForDialog = true;
        this.game.events.emit('memoryPairMatched', {
          imageUrl: first.imageUrl,
          title: first.title,
          description: first.description
        });
        return;
      }

      this.time.delayedCall(560, () => {
        this.flipCard(first, false);
        this.flipCard(second, false, () => {
          first.state = 'hidden';
          second.state = 'hidden';
          this.selectedCards = [];
          this.inputLocked = false;
        });
      });
    });
  }

  flipCard(card, reveal, onComplete) {
    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 110,
      ease: 'Sine.easeIn',
      onComplete: () => {
        card.front.setVisible(reveal);
        card.back.setVisible(!reveal);
        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 110,
          ease: 'Sine.easeOut',
          onComplete: () => onComplete?.()
        });
      }
    });
  }

  updateStatus() {
    this.statusText?.setText(`Pares completados: ${this.matchedPairs}/${this.totalPairs}`);
  }

  handleDialogClosed() {
    if (!this.waitingForDialog) {
      return;
    }

    this.waitingForDialog = false;

    if (this.completed) {
      this.emitExit('themes', 'victory');
      return;
    }

    this.inputLocked = false;
  }

  emitExit(to, reason = 'nav') {
    this.game.events.emit('exitToMenu', {
      game: 'memory',
      to,
      reason
    });
  }

  clearObjects(objects) {
    objects.forEach((entry) => {
      if (entry && typeof entry.destroy === 'function') {
        entry.destroy();
      }
    });
    objects.length = 0;
  }
}
