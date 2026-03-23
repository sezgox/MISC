import Phaser from 'phaser';

export default class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x8ecae6);
    this.add.rectangle(width * 0.5, height * 0.7, width, height * 0.6, 0xffefd5, 0.6);

    this.add
      .text(width * 0.5, 88, 'Gael Games', {
        fontFamily: 'Trebuchet MS',
        fontSize: '64px',
        color: '#0b3954',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 146, 'Elige un minijuego', {
        fontFamily: 'Trebuchet MS',
        fontSize: '30px',
        color: '#114b5f'
      })
      .setOrigin(0.5);

    this.createGameCard({
      x: width * 0.32,
      y: height * 0.47,
      title: 'Puzzle',
      subtitle: 'Arma la imagen',
      badge: 'PZ',
      color: 0xff9f1c,
      z: 10,
      onClick: () => this.scene.start('Puzzle')
    });

    this.createGameCard({
      x: width * 0.68,
      y: height * 0.47,
      title: 'Memory',
      subtitle: 'Encuentra pares',
      badge: 'MM',
      color: 0x2a9d8f,
      z: 10,
      onClick: () => this.scene.start('Memory')
    });
  }

  createGameCard({ x, y, title, subtitle, badge, color, onClick }) {
    const width = 380;
    const height = 300;

    const shadow = this.add.rectangle(8, 10, width, height, 0x000000, 0.14);
    const panel = this.add.rectangle(0, 0, width, height, color, 0.94).setStrokeStyle(4, 0xffffff, 0.9);
    const circle = this.add.circle(0, -62, 56, 0xffffff, 0.24);

    const badgeText = this.add
      .text(0, -64, badge, {
        fontFamily: 'Trebuchet MS',
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const titleText = this.add
      .text(0, 26, title, {
        fontFamily: 'Trebuchet MS',
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const subtitleText = this.add
      .text(0, 82, subtitle, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#f8f9fa'
      })
      .setOrigin(0.5);

    const card = this.add.container(x, y, [shadow, panel, circle, badgeText, titleText, subtitleText]);
    card.setSize(width, height);

    // Hit area en el panel (rectángulo completo) para que el hover funcione en toda la tarjeta
    panel.setInteractive({ useHandCursor: true });
    panel.input.cursor = 'pointer';

    panel.on('pointerover', () => {
      card.setScale(1.04);
    });

    panel.on('pointerout', () => {
      card.setScale(1);
    });

    panel.on('pointerup', () => {
      this.tweens.add({
        targets: card,
        scaleX: 0.98,
        scaleY: 0.98,
        yoyo: true,
        duration: 110
      });
      onClick();
    });
  }
}
