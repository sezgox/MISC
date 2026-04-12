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
    this.onResizeHandler = null;
    this.titleText = null;
    this.backgroundTop = null;
    this.backgroundBottom = null;
    this.deck = [];
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
    this.onResizeHandler = null;
    this.titleText = null;
    this.backgroundTop = null;
    this.backgroundBottom = null;
    this.deck = [];
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
    this.onResizeHandler = () => this.layoutBoard();
    this.scale.on('resize', this.onResizeHandler);

    const { width, height } = this.scale;
    this.backgroundTop = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfefae0);
    this.backgroundBottom = this.add.rectangle(width * 0.5, height * 0.72, width, height * 0.5, 0xade8f4, 0.35);
    this.sceneObjects.push(this.backgroundTop, this.backgroundBottom);

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
    this.deck = Phaser.Utils.Array.Shuffle(deck);

    this.titleText = this.add
      .text(width * 0.5, 32, `Memory - ${theme.name}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '36px',
        color: '#264653',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.titleText);

    this.statusText = this.add
      .text(width * 0.5, 66, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '21px',
        color: '#1d3557'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.statusText);
    this.updateStatus();

    this.deck.forEach((entry) => {
      const card = this.createMemoryCard({ x: width * 0.5, y: height * 0.5, width: 120, height: 120, entry });
      this.cards.push(card);
      this.sceneObjects.push(card.container);
    });

    this.layoutBoard();
  }

  layoutBoard() {
    if (!this.currentTheme || !this.titleText || !this.statusText) {
      return;
    }

    const { width, height } = this.scale;
    const { cols, rows } = this.getGridFor(this.deck.length);
    const isDesktop = width >= 1100;
    const isPortrait = height > width;
    const isWideBoard = cols >= 8;
    const boardGrowth = Phaser.Math.Clamp((this.deck.length - 16) / 16, 0, 1);
    const overlayReserve = isDesktop ? 8 : isPortrait ? Math.min(92, height * 0.12) : 32;
    const topPadding = isDesktop ? 10 : isPortrait ? 8 : 10;
    const titleSize = isDesktop
      ? Phaser.Math.Linear(32, 27, boardGrowth)
      : isPortrait
        ? Phaser.Math.Linear(22, 17, boardGrowth)
        : Phaser.Math.Linear(27, 22, boardGrowth);
    const statusSize = isDesktop
      ? Phaser.Math.Linear(18, 15, boardGrowth)
      : isPortrait
        ? Phaser.Math.Linear(14, 12, boardGrowth)
        : Phaser.Math.Linear(16, 13, boardGrowth);
    const titleY = overlayReserve + topPadding + titleSize * 0.46;
    const statusY = titleY + titleSize * 0.66 + (isPortrait ? 6 : 7);
    const boardTop = statusY + statusSize * 0.8 + (isPortrait ? 8 : 10);
    const gap = isDesktop
      ? isWideBoard
        ? 6
        : Phaser.Math.Linear(8, 6, boardGrowth)
      : isPortrait
        ? isWideBoard
          ? 4
          : Phaser.Math.Linear(6, 4, boardGrowth)
        : isWideBoard
          ? 5
          : Phaser.Math.Linear(7, 5, boardGrowth);
    const aspectRatio = isDesktop
      ? isWideBoard
        ? 0.88
        : Phaser.Math.Linear(1.02, 0.95, boardGrowth)
      : isPortrait
        ? isWideBoard
          ? 1
          : Phaser.Math.Linear(1.12, 1.02, boardGrowth)
        : isWideBoard
          ? 0.96
          : Phaser.Math.Linear(1.08, 1, boardGrowth);
    const horizontalPadding = isDesktop ? 10 : isPortrait ? 10 : 12;
    const bottomPadding = isDesktop ? 10 : isPortrait ? 14 : 12;
    const availableWidth = Math.max(220, width - horizontalPadding * 2);
    const availableHeight = Math.max(220, height - boardTop - bottomPadding);

    let cardWidth = (availableWidth - (cols - 1) * gap) / cols;
    let cardHeight = cardWidth * aspectRatio;

    if (cardHeight * rows + (rows - 1) * gap > availableHeight) {
      cardHeight = (availableHeight - (rows - 1) * gap) / rows;
      cardWidth = cardHeight / aspectRatio;
    }

    const boardWidth = cols * cardWidth + (cols - 1) * gap;
    const boardHeight = rows * cardHeight + (rows - 1) * gap;
    const startX = width * 0.5 - boardWidth * 0.5 + cardWidth * 0.5;
    const startY = boardTop + cardHeight * 0.5;
    const bottomBandHeight = Math.max(height * 0.22, boardHeight * 0.38);

    this.backgroundTop.setPosition(width * 0.5, height * 0.5);
    this.backgroundTop.setSize(width, height);
    this.backgroundBottom.setPosition(width * 0.5, height - bottomBandHeight * 0.5);
    this.backgroundBottom.setSize(width, bottomBandHeight);

    this.titleText
      .setPosition(width * 0.5, titleY)
      .setStyle({ fontSize: `${Math.round(titleSize)}px` });
    this.statusText
      .setPosition(width * 0.5, statusY)
      .setStyle({ fontSize: `${Math.round(statusSize)}px` });

    this.cards.forEach((card, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);
      this.layoutCard(card, {
        x,
        y,
        width: cardWidth,
        height: cardHeight,
        shadowOffsetX: Math.max(3, cardWidth * 0.04),
        shadowOffsetY: Math.max(4, cardHeight * 0.05)
      });
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
    if (this.onResizeHandler) {
      this.scale.off('resize', this.onResizeHandler);
      this.onResizeHandler = null;
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
      shadow,
      hitPanel: frame,
      front,
      back,
      frame
    };

    frame.on('pointerup', () => this.handleCardClick(card));

    return card;
  }

  layoutCard(card, { x, y, width, height, shadowOffsetX, shadowOffsetY }) {
    const inset = Math.max(8, Math.min(width, height) * 0.1);

    card.container.setPosition(x, y);
    card.container.setSize(width, height);
    card.shadow.setPosition(shadowOffsetX, shadowOffsetY);
    card.shadow.setSize(width, height);
    card.frame.setSize(width, height);
    card.front.setDisplaySize(width - inset, height - inset);
    card.back.setDisplaySize(width - inset, height - inset);

    if (card.state === 'matched') {
      card.frame.setStrokeStyle(3, 0x2a9d8f, 1);
    } else {
      card.frame.setStrokeStyle(2, 0xadb5bd, 0.9);
    }
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
