import Phaser from 'phaser';
import { memoryCardBack, memoryThemes } from '../games/memory/themes';

export default class MemoryScene extends Phaser.Scene {
  constructor() {
    super('Memory');

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

  preload() {
    this.load.image('memory-card-back', memoryCardBack);

    memoryThemes.forEach((theme) => {
      theme.cards.forEach((card) => {
        this.load.image(card.key, card.imageUrl);
      });
    });
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfefae0);
    this.add.rectangle(width * 0.5, height * 0.72, width, height * 0.5, 0xade8f4, 0.35);

    this.events.once('shutdown', this.onShutdown, this);
    this.onDialogClosedHandler = () => this.handleDialogClosed();
    this.game.events.on('memoryDialogClosed', this.onDialogClosedHandler);
    this.showThemeSelector();
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

  showThemeSelector() {
    this.clearObjects(this.sceneObjects);
    this.cards = [];
    this.selectedCards = [];
    this.inputLocked = false;
    this.waitingForDialog = false;

    const { width, height } = this.scale;

    const homeBtn = this.createButton({
      x: 90,
      y: 44,
      width: 150,
      height: 44,
      label: 'Inicio',
      color: 0x5f6caf,
      onClick: () => this.scene.start('Home')
    });
    this.sceneObjects.push(homeBtn.container);

    const title = this.add
      .text(width * 0.5, 64, 'Memory', {
        fontFamily: 'Trebuchet MS',
        fontSize: '54px',
        color: '#264653',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(title);

    const subtitle = this.add
      .text(width * 0.5, 112, 'Elige una tematica', {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#1d3557'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(subtitle);

    const columns = 2;
    const rows = Math.ceil(memoryThemes.length / columns);
    const cardWidth = 380;
    const cardHeight = 200;
    const gapX = 56;
    const gapY = 44;
    const totalWidth = columns * cardWidth + (columns - 1) * gapX;
    const totalHeight = rows * cardHeight + (rows - 1) * gapY;
    const startX = width * 0.5 - totalWidth * 0.5 + cardWidth * 0.5;
    const startY = height * 0.5 - totalHeight * 0.5 + cardHeight * 0.5 + 36;

    memoryThemes.forEach((theme, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      const panel = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff, 0.9).setStrokeStyle(4, 0x8ecae6, 0.9);
      const icon = this.add.image(-120, 0, theme.cards[0].key).setDisplaySize(112, 112);
      const name = this.add
        .text(40, -16, theme.name, {
          fontFamily: 'Trebuchet MS',
          fontSize: '42px',
          color: '#1b4332',
          fontStyle: 'bold'
        })
        .setOrigin(0.5);
      const description = this.add
        .text(40, 36, `${theme.cards.length} pares`, {
          fontFamily: 'Trebuchet MS',
          fontSize: '24px',
          color: '#1d3557'
        })
        .setOrigin(0.5);

      const card = this.add.container(x, y, [panel, icon, name, description]);
      card.setSize(cardWidth, cardHeight);
      card.setInteractive(new Phaser.Geom.Rectangle(-cardWidth * 0.5, -cardHeight * 0.5, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
      card.input.cursor = 'pointer';

      card.on('pointerover', () => {
        card.setScale(1.03);
        panel.setStrokeStyle(4, 0x2a9d8f, 0.95);
      });

      card.on('pointerout', () => {
        card.setScale(1);
        panel.setStrokeStyle(4, 0x8ecae6, 0.9);
      });

      card.on('pointerup', () => this.startTheme(theme.key));

      this.sceneObjects.push(card);
    });
  }

  startTheme(themeKey) {
    const theme = memoryThemes.find((entry) => entry.key === themeKey);
    if (!theme) {
      return;
    }

    this.currentTheme = theme;
    this.inputLocked = false;
    this.selectedCards = [];
    this.completed = false;
    this.waitingForDialog = false;
    this.matchedPairs = 0;
    this.totalPairs = theme.cards.length;

    this.clearObjects(this.sceneObjects);
    this.cards = [];

    const { width, height } = this.scale;

    const homeBtn = this.createButton({
      x: 90,
      y: 40,
      width: 150,
      height: 42,
      label: 'Inicio',
      color: 0x5f6caf,
      onClick: () => this.scene.start('Home')
    });
    this.sceneObjects.push(homeBtn.container);

    const themesBtn = this.createButton({
      x: width - 128,
      y: 40,
      width: 210,
      height: 42,
      label: 'Tematicas',
      color: 0x4cc9f0,
      onClick: () => this.showThemeSelector()
    });
    this.sceneObjects.push(themesBtn.container);

    const title = this.add
      .text(width * 0.5, 42, `Memory - ${theme.name}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#264653',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(title);

    this.statusText = this.add
      .text(width * 0.5, 80, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#1d3557'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.statusText);
    this.updateStatus();

    const deck = [];
    theme.cards.forEach((card) => {
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
    const gap = 14;
    const availableWidth = width * 0.92;
    const availableHeight = height - 170;
    let cardWidth = (availableWidth - (cols - 1) * gap) / cols;
    let cardHeight = cardWidth * 1.2;

    if (cardHeight * rows + (rows - 1) * gap > availableHeight) {
      cardHeight = (availableHeight - (rows - 1) * gap) / rows;
      cardWidth = cardHeight / 1.2;
    }

    const boardWidth = cols * cardWidth + (cols - 1) * gap;
    const boardHeight = rows * cardHeight + (rows - 1) * gap;
    const startX = width * 0.5 - boardWidth * 0.5 + cardWidth * 0.5;
    const startY = height * 0.56 - boardHeight * 0.5 + cardHeight * 0.5 + 34;

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

  getGridFor(totalCards) {
    if (totalCards <= 16) {
      return { cols: 4, rows: Math.ceil(totalCards / 4) };
    }

    if (totalCards <= 20) {
      return { cols: 5, rows: Math.ceil(totalCards / 5) };
    }

    return { cols: 6, rows: Math.ceil(totalCards / 6) };
  }

  createMemoryCard({ x, y, width, height, entry }) {
    const shadow = this.add.rectangle(4, 6, width, height, 0x000000, 0.15);
    const frame = this.add.rectangle(0, 0, width + 2, height + 2, 0xffffff, 0.96).setStrokeStyle(2, 0xadb5bd, 0.9);
    const front = this.add.image(0, 0, entry.textureKey).setDisplaySize(width - 10, height - 10).setVisible(false);
    const back = this.add.image(0, 0, 'memory-card-back').setDisplaySize(width - 10, height - 10).setVisible(true);

    const container = this.add.container(x, y, [shadow, frame, front, back]);
    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height), Phaser.Geom.Rectangle.Contains);
    container.input.cursor = 'pointer';

    const card = {
      pairId: entry.pairId,
      title: entry.title,
      description: entry.description,
      imageUrl: entry.imageUrl,
      state: 'hidden',
      container,
      front,
      back,
      frame
    };

    container.on('pointerup', () => this.handleCardClick(card));

    return card;
  }

  handleCardClick(card) {
    if (this.inputLocked || card.state !== 'hidden') {
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
        first.container.disableInteractive();
        second.container.disableInteractive();
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

  showVictoryPanel() {
    const { width, height } = this.scale;
    const shade = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x000000, 0.42).setDepth(40);
    const panel = this.add.rectangle(width * 0.5, height * 0.5, 620, 292, 0xffffff, 0.98).setStrokeStyle(4, 0x2a9d8f, 1).setDepth(41);
    const title = this.add
      .text(width * 0.5, height * 0.42, 'Excelente!\nHas encontrado todos los pares', {
        fontFamily: 'Trebuchet MS',
        fontSize: '42px',
        color: '#1f7a8c',
        align: 'center',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(41);

    const againBtn = this.createButton({
      x: width * 0.42,
      y: height * 0.59,
      width: 220,
      height: 54,
      label: 'Otra vez',
      color: 0x2a9d8f,
      onClick: () => this.startTheme(this.currentTheme.key)
    });
    againBtn.container.setDepth(41);

    const themesBtn = this.createButton({
      x: width * 0.58,
      y: height * 0.59,
      width: 220,
      height: 54,
      label: 'Tematicas',
      color: 0x4cc9f0,
      onClick: () => this.showThemeSelector()
    });
    themesBtn.container.setDepth(41);

    this.sceneObjects.push(shade, panel, title, againBtn.container, themesBtn.container);
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
      this.inputLocked = true;
      this.showVictoryPanel();
      return;
    }

    this.inputLocked = false;
  }

  createButton({ x, y, width, height, label, color, onClick }) {
    const shadow = this.add.rectangle(4, 6, width, height, 0x000000, 0.18);
    const panel = this.add.rectangle(0, 0, width, height, color, 0.95).setStrokeStyle(3, 0xffffff, 0.85);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '23px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [shadow, panel, text]);
    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height), Phaser.Geom.Rectangle.Contains);
    container.input.cursor = 'pointer';

    container.on('pointerover', () => {
      panel.setFillStyle(Phaser.Display.Color.Lighten(Phaser.Display.Color.ValueToColor(color), 18).color, 0.97);
      container.setScale(1.03);
    });
    container.on('pointerout', () => {
      panel.setFillStyle(color, 0.95);
      container.setScale(1);
    });
    container.on('pointerup', () => onClick?.());

    return { container, panel, text };
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
