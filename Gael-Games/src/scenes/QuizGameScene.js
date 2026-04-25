import Phaser from 'phaser';
import { quizThemes } from '../games/quiz/themes';

const COL_BG = 0xfefae0;
const COL_SEA = 0xade8f4;
const COL_PANEL = 0xffffff;
const COL_BTN = 0x2a9d8f;
const COL_BTN_HOV = 0x1d7a6e;
const COL_CORRECT = 0x2dc653;
const COL_WRONG = 0xe63946;
const COL_VOLVER = 0x5f6caf;
const COL_STROKE = 0x1d3557;

export default class QuizGameScene extends Phaser.Scene {
  constructor() {
    super('QuizGame');
  }

  init(data) {
    this.themeKey = data?.themeKey ?? '';
    this.score = { correct: 0, wrong: 0 };
    this.roundIndex = 0;
    this.answering = false;
    this.rounds = [];
    this.allCards = [];
    this.themeName = '';
    this.cardImage = null;
    this.roundLabel = null;
    this.themeTitle = null;
    this.scoreLabel = null;
    this.optionButtons = [];
    this.bgTop = null;
    this.bgBottom = null;
    this.headerBar = null;
    this.imagePanel = null;
    this.onResizeHandler = null;
    this.phase = 'playing';
    this.victoryUi = null;
    this._layoutImageMax = 200;
  }

  create() {
    this.events.once('shutdown', this.onShutdown, this);

    const theme = quizThemes.find((t) => t.key === this.themeKey);
    if (!theme || theme.cards.length < 3) {
      this.emitExit('themes', 'error');
      return;
    }

    this.themeName = theme.name;
    this.allCards = theme.cards;
    this.rounds = Phaser.Utils.Array.Shuffle([...theme.cards]);

    this.onResizeHandler = () => this.applyLayout();
    this.scale.on('resize', this.onResizeHandler);

    this.buildScene();
    this.showRound();
  }

  buildScene() {
    this.bgTop = this.add.rectangle(0, 0, 100, 100, COL_BG);
    this.bgBottom = this.add.rectangle(0, 0, 100, 100, COL_SEA, 0.3);
    this.headerBar = this.add.rectangle(0, 0, 100, 72, 0x114b5f, 0.9);

    this.roundLabel = this.add.text(0, 0, '', {
      fontFamily: '"Trebuchet MS", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f8f9fa'
    }).setOrigin(0, 0.5);

    this.themeTitle = this.add.text(0, 0, this.themeName, {
      fontFamily: '"Trebuchet MS", sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ade8f4'
    }).setOrigin(0.5, 0.5);

    this.scoreLabel = this.add.text(0, 0, '', {
      fontFamily: '"Trebuchet MS", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f8f9fa'
    }).setOrigin(1, 0.5);

    this.imagePanel = this.add
      .rectangle(0, 0, 100, 100, COL_PANEL, 0.95)
      .setStrokeStyle(3, COL_STROKE, 0.15);

    this.cardImage = this.add.image(0, 0, '');

    this.optionButtons = [];
    for (let i = 0; i < 3; i++) {
      const bg = this.add
        .rectangle(0, 0, 100, 50, COL_BTN)
        .setStrokeStyle(3, COL_STROKE, 0.25)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(0, 0, '', {
          fontFamily: '"Trebuchet MS", sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffffff',
          wordWrap: { width: 200 },
          align: 'center'
        })
        .setOrigin(0.5, 0.5);

      const idx = i;
      bg.on('pointerover', () => {
        if (!this.answering) bg.setFillStyle(COL_BTN_HOV);
      });
      bg.on('pointerout', () => {
        if (!this.answering) bg.setFillStyle(COL_BTN);
      });
      bg.on('pointerdown', () => {
        if (this.answering) return;
        this.handleAnswer(idx);
      });

      this.optionButtons.push({ bg, label });
    }
  }

  applyLayout() {
    if (this.phase === 'victory' && this.victoryUi) {
      this.layoutVictory();
      return;
    }
    this.layoutPlaying();
  }

  layoutPlaying() {
    const { width, height } = this.scale;
    const pad = Math.max(10, Math.min(20, width * 0.04));
    const isPortrait = height > width;
    const useRow = width >= 700;
    const headerH = Phaser.Math.Clamp(isPortrait ? 52 : 56, 44, 68);
    const headerY = headerH * 0.5;

    this.bgTop.setPosition(width * 0.5, height * 0.5);
    this.bgTop.setSize(width, height);

    const bottomH = height * 0.42;
    this.bgBottom.setPosition(width * 0.5, height - bottomH * 0.5);
    this.bgBottom.setSize(width, bottomH);

    this.headerBar.setPosition(width * 0.5, headerY);
    this.headerBar.setSize(width, headerH);

    const roundSize = Phaser.Math.Clamp(Math.round(width * 0.042), 12, 22);
    const themeSize = Phaser.Math.Clamp(Math.round(width * 0.035), 11, 20);
    const scoreSize = Phaser.Math.Clamp(Math.round(width * 0.042), 12, 22);
    this.roundLabel.setStyle({ fontSize: `${roundSize}px` });
    this.scoreLabel.setStyle({ fontSize: `${scoreSize}px` });
    this.themeTitle.setStyle({ fontSize: `${themeSize}px` });

    this.roundLabel.setPosition(pad, headerY);
    this.roundLabel.setStyle({ wordWrap: { width: Math.max(80, width * 0.28) } });

    this.themeTitle.setPosition(width * 0.5, headerY);
    this.themeTitle.setText(this.truncateTheme(this.themeName, width < 400 ? 18 : 28));

    this.scoreLabel.setPosition(width - pad, headerY);
    this.scoreLabel.setStyle({ wordWrap: { width: Math.max(90, width * 0.3) } });

    const btnAreaEstimate = useRow ? 100 : 200;
    const imageMax = Math.min(
      360,
      width - 2 * pad,
      Math.max(120, height - headerH - pad * 2 - btnAreaEstimate)
    );
    this._layoutImageMax = imageMax;
    const imageCy = headerH + pad + imageMax * 0.5 + (isPortrait ? 4 : 8);

    this.imagePanel.setPosition(width * 0.5, imageCy);
    this.imagePanel.setSize(imageMax + 24, imageMax + 24);

    this.cardImage.setPosition(width * 0.5, imageCy);
    this.refreshImageScale();

    const gap = useRow ? 12 : 10;
    const btnH = Phaser.Math.Clamp(useRow ? 56 : 50, 44, 64);
    if (useRow) {
      const maxBtnW = 330;
      const totalInner = width - 2 * pad;
      const btnW = Math.min(maxBtnW, (totalInner - 2 * gap) / 3);
      const totalW = 3 * btnW + 2 * gap;
      const startX = (width - totalW) / 2 + btnW / 2;
      const btnY = Math.min(height - pad - btnH / 2, imageCy + imageMax * 0.5 + pad + btnH * 0.5 + 8);

      for (let i = 0; i < 3; i++) {
        const cx = startX + i * (btnW + gap);
        const { bg, label } = this.optionButtons[i];
        bg.setPosition(cx, btnY);
        bg.setSize(btnW, btnH);
        label.setPosition(cx, btnY);
        const fontRow = Phaser.Math.Clamp(Math.round(btnW * 0.055), 14, 20);
        label.setStyle({ wordWrap: { width: btnW - 20 }, fontSize: `${fontRow}px` });
      }
    } else {
      const btnW = width - 2 * pad;
      const firstBtnY = imageCy + imageMax * 0.5 + pad + btnH * 0.5;
      const fontCol = Phaser.Math.Clamp(Math.round(width * 0.042), 14, 19);
      for (let i = 0; i < 3; i++) {
        const { bg, label } = this.optionButtons[i];
        const y = firstBtnY + i * (btnH + gap);
        bg.setPosition(width * 0.5, y);
        bg.setSize(btnW, btnH);
        label.setPosition(width * 0.5, y);
        label.setStyle({ wordWrap: { width: btnW - 20 }, fontSize: `${fontCol}px` });
      }
    }
  }

  truncateTheme(name, maxChars) {
    if (!name || name.length <= maxChars) return name;
    return `${name.slice(0, maxChars - 1)}…`;
  }

  refreshImageScale() {
    if (!this.cardImage?.texture?.key) return;
    const w = this.cardImage.width;
    const h = this.cardImage.height;
    if (!w || !h) return;
    const imageMax = this._layoutImageMax || 200;
    const scaleToFit = Math.min(imageMax / w, imageMax / h);
    this.cardImage.setScale(scaleToFit);
  }

  showRound() {
    if (this.roundIndex >= this.rounds.length) {
      this.showVictory();
      return;
    }

    this.answering = false;
    const correctCard = this.rounds[this.roundIndex];

    const distractors = Phaser.Utils.Array.Shuffle(this.allCards.filter((c) => c.key !== correctCard.key)).slice(0, 2);

    const options = Phaser.Utils.Array.Shuffle([correctCard, ...distractors]);
    this.correctOptionIndex = options.findIndex((c) => c.key === correctCard.key);

    this.roundLabel.setText(`Ronda ${this.roundIndex + 1} / ${this.rounds.length}`);
    this.scoreLabel.setText(`✓ ${this.score.correct}   ✗ ${this.score.wrong}`);

    this.cardImage.setTexture(correctCard.key);
    this.cardImage.setVisible(true);
    this.refreshImageScale();

    options.forEach((card, i) => {
      const { bg, label } = this.optionButtons[i];
      bg.setFillStyle(COL_BTN).setStrokeStyle(3, COL_STROKE, 0.25).setVisible(true);
      label.setText(card.title).setVisible(true);
    });

    this.imagePanel.setVisible(true);
    this.applyLayout();
  }

  handleAnswer(selectedIndex) {
    this.answering = true;

    if (selectedIndex === this.correctOptionIndex) {
      this.score.correct++;
      this.optionButtons[selectedIndex].bg.setFillStyle(COL_CORRECT);
    } else {
      this.score.wrong++;
      this.optionButtons[selectedIndex].bg.setFillStyle(COL_WRONG);
      this.optionButtons[this.correctOptionIndex].bg.setFillStyle(COL_CORRECT);
    }

    this.roundIndex++;
    this.time.delayedCall(1400, () => this.showRound());
  }

  showVictory() {
    this.phase = 'victory';
    this.cardImage.setVisible(false);
    this.imagePanel.setVisible(false);
    this.optionButtons.forEach(({ bg, label }) => {
      bg.setVisible(false);
      label.setVisible(false);
    });
    this.headerBar.setVisible(false);
    this.roundLabel.setVisible(false);
    this.themeTitle.setVisible(false);
    this.scoreLabel.setVisible(false);

    const total = this.rounds.length;
    const correct = this.score.correct;
    const pct = total > 0 ? correct / total : 0;
    this.victoryUi = { pct, total, correct };

    this.victoryUi.panelShadow = this.add.rectangle(0, 0, 10, 10, 0x000000, 0.18);
    this.victoryUi.panel = this.add
      .rectangle(0, 0, 10, 10, COL_PANEL)
      .setStrokeStyle(4, COL_BTN);

    const emoji = pct === 1 ? '🏆' : pct >= 0.7 ? '⭐' : '👍';
    this.victoryUi.title = this.add
      .text(0, 0, `${emoji}  ¡Quiz completado!`, {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#114b5f',
        align: 'center',
        wordWrap: { width: 400 }
      })
      .setOrigin(0.5);

    this.victoryUi.scoreLine = this.add
      .text(0, 0, `${correct} de ${total} correctas`, {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: pct >= 0.7 ? '#2a9d8f' : '#e63946'
      })
      .setOrigin(0.5);

    this.victoryUi.pctLine = this.add
      .text(0, 0, `${Math.round(pct * 100)}% de aciertos`, {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '20px',
        color: '#355070'
      })
      .setOrigin(0.5);

    this.victoryUi.btnVolver = this.add
      .rectangle(0, 0, 240, 58, COL_VOLVER)
      .setInteractive({ useHandCursor: true });
    this.victoryUi.btnLabel = this.add
      .text(0, 0, 'Volver', {
        fontFamily: '"Trebuchet MS", sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.victoryUi.btnVolver.on('pointerover', () => this.victoryUi.btnVolver.setFillStyle(0x4a5a9f));
    this.victoryUi.btnVolver.on('pointerout', () => this.victoryUi.btnVolver.setFillStyle(COL_VOLVER));
    this.victoryUi.btnVolver.on('pointerdown', () => this.emitExit('themes', 'victory'));

    this.layoutVictory();
  }

  layoutVictory() {
    if (!this.victoryUi) return;
    const { width, height } = this.scale;
    const { pct, total, correct } = this.victoryUi;
    const pad = Math.max(16, width * 0.04);
    const panelW = Math.min(680, width - 2 * pad);
    const panelH = Math.min(380, height * 0.55);
    const cx = width * 0.5;
    const cy = height * 0.5;

    this.victoryUi.panelShadow.setPosition(cx + 4, cy + 4);
    this.victoryUi.panelShadow.setSize(panelW, panelH);

    this.victoryUi.panel.setPosition(cx, cy);
    this.victoryUi.panel.setSize(panelW, panelH);

    const titleSize = Phaser.Math.Clamp(Math.round(width * 0.028), 16, 32);
    const scoreSize = Phaser.Math.Clamp(Math.round(width * 0.04), 24, 48);
    const subSize = Phaser.Math.Clamp(Math.round(width * 0.022), 14, 24);
    this.victoryUi.title.setStyle({
      fontSize: `${titleSize}px`,
      wordWrap: { width: panelW - 24 }
    });
    this.victoryUi.title.setPosition(cx, cy - panelH * 0.32);

    this.victoryUi.scoreLine.setText(`${correct} de ${total} correctas`);
    this.victoryUi.scoreLine.setStyle({ fontSize: `${scoreSize}px` });
    this.victoryUi.scoreLine.setPosition(cx, cy - panelH * 0.02);

    this.victoryUi.pctLine.setStyle({ fontSize: `${subSize}px` });
    this.victoryUi.pctLine.setPosition(cx, cy + panelH * 0.16);

    const btnW = Math.min(240, panelW - 32);
    const btnH = Phaser.Math.Clamp(50, 44, 58);
    const btnY = cy + panelH * 0.36;
    this.victoryUi.btnVolver.setPosition(cx, btnY);
    this.victoryUi.btnVolver.setSize(btnW, btnH);
    this.victoryUi.btnLabel.setPosition(cx, btnY);
    this.victoryUi.btnLabel.setStyle({ fontSize: `${Math.min(26, Math.round(btnW * 0.1))}px` });

    this.victoryUi.scoreLine.setStyle({ color: pct >= 0.7 ? '#2a9d8f' : '#e63946' });
  }

  emitExit(to, reason) {
    this.game.events.emit('exitToMenu', { game: 'quiz', to, reason });
  }

  onShutdown() {
    if (this.onResizeHandler) {
      this.scale.off('resize', this.onResizeHandler);
    }
    this.optionButtons = [];
    this.cardImage = null;
    this.roundLabel = null;
    this.scoreLabel = null;
    this.themeTitle = null;
    this.victoryUi = null;
  }
}
