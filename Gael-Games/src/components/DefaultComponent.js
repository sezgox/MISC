import Phaser from 'phaser';

/**
 * Comportamiento por defecto para contenedores interactivos:
 * - HOVER: escala mayor + cursor pointer
 * - NOT HOVER: escala 1 + cursor normal
 *
 * Uso: DefaultComponent.apply(scene, container, { width, height, onClick, ... })
 */
export default class DefaultComponent {
  /**
   * @param {Phaser.Scene} scene - Escena de Phaser
   * @param {Phaser.GameObjects.Container} container - Contenedor al que aplicar el comportamiento
   * @param {Object} options
   * @param {number} options.width - Ancho del hit area
   * @param {number} options.height - Alto del hit area
   * @param {number} [options.hoverScale=1.05] - Escala al hacer hover
   * @param {number} [options.hoverDuration=80] - Duración del tween en ms
   * @param {Function} [options.onPointerOver] - Callback al entrar con el ratón
   * @param {Function} [options.onPointerOut] - Callback al salir (en onComplete del tween)
   * @param {Function} [options.onClick] - Callback al hacer clic
   * @returns {Phaser.GameObjects.Container}
   */
  static apply(scene, container, options = {}) {
    const {
      width,
      height,
      hoverScale = 1.05,
      hoverDuration = 80,
      onPointerOver,
      onPointerOut,
      onClick
    } = options;

    const hitArea = new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input.cursor = 'pointer';

    container.on('pointerover', () => {
      scene.tweens.killTweensOf(container);
      scene.tweens.add({
        targets: container,
        scaleX: hoverScale,
        scaleY: hoverScale,
        duration: hoverDuration,
        ease: 'Cubic.easeOut'
      });
      onPointerOver?.();
    });

    container.on('pointerout', () => {
      scene.input.setDefaultCursor('default');
      scene.tweens.killTweensOf(container);
      scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: hoverDuration,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          onPointerOut?.();
        }
      });
    });

    container.on('pointerup', () => {
      onClick?.();
    });

    return container;
  }
}
