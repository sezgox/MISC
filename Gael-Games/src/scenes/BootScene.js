import Phaser from 'phaser';
import { memoryCardBack, memoryThemes } from '../games/memory/themes';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
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
    this.game.events.emit('memoryAssetsReady');
    this.scene.stop();
  }
}
