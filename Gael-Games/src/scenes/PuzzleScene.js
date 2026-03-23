import Phaser from 'phaser';
import DefaultComponent from '../components/DefaultComponent';
import { puzzleGallery } from '../games/puzzle/gallery';

const LAST_IMAGE_STORAGE_KEY = 'gael.puzzle.lastImage';
const LAST_IMAGE_NAME_KEY = 'gael.puzzle.lastImageName';

export default class PuzzleScene extends Phaser.Scene {
  constructor() {
    super('Puzzle');

    this.pieceOptions = [
      { label: '6 piezas (3x2)', cols: 3, rows: 2 },
      { label: '12 piezas (4x3)', cols: 4, rows: 3 },
      { label: '20 piezas (5x4)', cols: 5, rows: 4 }
    ];

    this.selectedOption = this.pieceOptions[0];
    this.pendingImage = null;
    this.currentSourceKey = null;
    this.dynamicTextureKeys = [];
    this.setupObjects = [];
    this.gameObjects = [];
    this.pieces = [];
    this.mode = 'setup';
    this.toastText = null;
    this.snapDistance = 40;
  }

  preload() {
    puzzleGallery.forEach((item) => {
      this.load.image(item.previewKey, item.url);
    });

    const lastImage = this.getLastSavedImage();
    if (lastImage?.dataUrl) {
      this.load.image('puzzle-last-saved', lastImage.dataUrl);
    }
  }

  create() {
    const { width, height } = this.scale;

    this.input.setDefaultCursor('default');

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfff4cc);
    this.add.rectangle(width * 0.5, height * 0.75, width, height * 0.55, 0xcaf0f8, 0.42);

    this.input.on('dragstart', this.onDragStart, this);
    this.input.on('drag', this.onDrag, this);
    this.input.on('dragend', this.onDragEnd, this);
    this.events.once('shutdown', this.onShutdown, this);

    this.createSetupUI();
  }

  onShutdown() {
    this.input.off('dragstart', this.onDragStart, this);
    this.input.off('drag', this.onDrag, this);
    this.input.off('dragend', this.onDragEnd, this);
    this.cleanupPuzzleBoard();
    this.clearObjects(this.setupObjects);
    this.toastText?.destroy();
  }

  createSetupUI() {
    this.mode = 'setup';
    this.cleanupPuzzleBoard();
    this.clearObjects(this.setupObjects);

    const { width, height } = this.scale;

    const homeBtn = this.createButton({
      x: 92,
      y: 46,
      width: 150,
      height: 44,
      label: 'Inicio',
      color: 0x5f6caf,
      onClick: () => this.scene.start('Home')
    });
    this.setupObjects.push(homeBtn.container);

    const title = this.add
      .text(width * 0.5, 56, 'Puzzle', {
        fontFamily: 'Trebuchet MS',
        fontSize: '52px',
        color: '#254441',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.setupObjects.push(title);

    const subtitle = this.add
      .text(width * 0.5, 102, 'Elige piezas y una imagen para jugar', {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#1e6091'
      })
      .setOrigin(0.5);
    this.setupObjects.push(subtitle);

    const piecesLabel = this.add
      .text(width * 0.5, 154, 'Numero de piezas', {
        fontFamily: 'Trebuchet MS',
        fontSize: '28px',
        color: '#2b2d42',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.setupObjects.push(piecesLabel);

    this.optionButtons = this.pieceOptions.map((option, index) => {
      const button = this.createButton({
        x: width * 0.5 + (index - 1) * 250,
        y: 202,
        width: 220,
        height: 56,
        label: option.label,
        color: 0xff9f1c,
        onClick: () => {
          this.selectedOption = option;
          this.updateOptionSelection();
        },
        onPointerOut: () => this.updateOptionSelection()
      });

      this.setupObjects.push(button.container);
      return { option, button };
    });

    this.updateOptionSelection();

    const imageLabel = this.add
      .text(width * 0.5, 272, 'Imagen de juego', {
        fontFamily: 'Trebuchet MS',
        fontSize: '28px',
        color: '#2b2d42',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.setupObjects.push(imageLabel);

    const galleryXStart = width * 0.5 - ((puzzleGallery.length - 1) * 170) / 2;
    this.galleryCards = puzzleGallery.map((item, index) => {
      const card = this.createImageCard({
        x: galleryXStart + index * 170,
        y: 392,
        width: 150,
        height: 156,
        textureKey: item.previewKey,
        label: item.name,
        onClick: () => this.selectSource({
          id: `gallery-${item.id}`,
          label: item.name,
          url: item.url
        })
      });

      this.setupObjects.push(card.container);
      return { id: `gallery-${item.id}`, card };
    });

    const pickFileButton = this.createButton({
      x: width * 0.36,
      y: 562,
      width: 280,
      height: 56,
      label: 'Elegir archivo',
      color: 0x4cc9f0,
      onClick: () => this.openFileDialog()
    });
    this.setupObjects.push(pickFileButton.container);

    const startButton = this.createButton({
      x: width * 0.68,
      y: 562,
      width: 280,
      height: 56,
      label: 'Comenzar puzzle',
      color: 0x2a9d8f,
      onClick: () => this.startPuzzle()
    });
    this.setupObjects.push(startButton.container);

    this.selectedSourceText = this.add
      .text(width * 0.5, height - 48, 'Sin imagen seleccionada', {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#264653'
      })
      .setOrigin(0.5);
    this.setupObjects.push(this.selectedSourceText);

    const lastImage = this.getLastSavedImage();
    if (lastImage?.dataUrl) {
      const useLastButton = this.createButton({
        x: width * 0.5,
        y: 624,
        width: 320,
        height: 46,
        label: `Usar ultima (${lastImage.name ?? 'archivo'})`,
        color: 0x4361ee,
        onClick: () =>
          this.selectSource({
            id: 'last-image',
            label: `Ultima imagen (${lastImage.name ?? 'archivo'})`,
            url: lastImage.dataUrl
          })
      });
      this.setupObjects.push(useLastButton.container);
    }

    if (!this.pendingImage && puzzleGallery.length > 0) {
      const first = puzzleGallery[0];
      this.selectSource({
        id: `gallery-${first.id}`,
        label: first.name,
        url: first.url
      });
    } else if (this.pendingImage) {
      this.updateSourceSelection();
    }
  }

  createButton({ x, y, width, height, label, color, onClick, onPointerOut }) {
    const panel = this.add.rectangle(0, 0, width, height, color, 0.95).setStrokeStyle(3, 0xffffff, 0.85);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [panel, text]);
    container.setSize(width, height);

    DefaultComponent.apply(this, container, {
      width,
      height,
      onPointerOver: () => {
        panel.setFillStyle(Phaser.Display.Color.Lighten(Phaser.Display.Color.ValueToColor(color), 16).color, 0.98);
        panel.setStrokeStyle(4, 0xffffff, 1);
      },
      onPointerOut: () => {
        panel.setFillStyle(color, 0.95);
        panel.setStrokeStyle(3, 0xffffff, 0.85);
        onPointerOut?.();
      },
      onClick
    });

    return { container, panel, text };
  }

  createImageCard({ x, y, width, height, textureKey, label, onClick }) {
    const panel = this.add.rectangle(0, 0, width, height, 0xffffff, 0.85).setStrokeStyle(3, 0xadb5bd, 0.9);
    const image = this.add.image(0, -12, textureKey).setDisplaySize(width - 24, height - 66);
    const text = this.add
      .text(0, height * 0.5 - 22, label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#264653',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [panel, image, text]);
    container.setSize(width, height);

    DefaultComponent.apply(this, container, {
      width,
      height,
      hoverScale: 1.06,
      onPointerOver: () => {
        panel.setFillStyle(0xf0f4f8, 0.95);
        panel.setStrokeStyle(4, 0x1d3557, 0.9);
      },
      onPointerOut: () => {
        panel.setFillStyle(0xffffff, 0.85);
        this.updateSourceSelection();
      },
      onClick
    });

    return { container, panel };
  }

  updateOptionSelection() {
    this.optionButtons.forEach(({ option, button }) => {
      const active = option === this.selectedOption;
      button.panel.setStrokeStyle(active ? 5 : 3, active ? 0x1d3557 : 0xffffff, 0.95);
    });
  }

  selectSource(source) {
    this.pendingImage = source;
    this.updateSourceSelection();
  }

  updateSourceSelection() {
    this.galleryCards?.forEach((entry) => {
      const isActive = entry.id === this.pendingImage?.id;
      entry.card.panel.setStrokeStyle(isActive ? 5 : 3, isActive ? 0x1d3557 : 0xadb5bd, 0.95);
    });

    if (this.selectedSourceText) {
      this.selectedSourceText.setText(`Imagen: ${this.pendingImage?.label ?? 'sin seleccionar'}`);
    }
  }

  openFileDialog() {
    const fileInput = document.getElementById('puzzle-file-input');
    if (!fileInput) {
      this.showToast('No se encontro input de archivo', '#9d0208');
      return;
    }

    fileInput.value = '';
    fileInput.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? '');
        if (!dataUrl) {
          this.showToast('No se pudo leer el archivo', '#9d0208');
          return;
        }

        this.selectSource({
          id: 'file-custom',
          label: file.name,
          url: dataUrl
        });

        this.saveLastImage(dataUrl, file.name);
        this.showToast(`Archivo cargado: ${file.name}`);
      };

      reader.onerror = () => {
        this.showToast('Error leyendo archivo', '#9d0208');
      };

      reader.readAsDataURL(file);
    };

    fileInput.click();
  }

  startPuzzle() {
    if (!this.pendingImage?.url) {
      this.showToast('Primero elige una imagen', '#9d0208');
      return;
    }

    this.mode = 'loading';
    this.clearObjects(this.setupObjects);

    const loading = this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.5, 'Cargando puzzle...', {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#1d3557',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.setupObjects.push(loading);

    const sourceKey = `puzzle-source-${Date.now()}`;
    const onComplete = () => {
      this.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
      this.clearObjects(this.setupObjects);
      this.buildPuzzle(sourceKey);
    };

    const onError = (file) => {
      if (file?.key !== sourceKey) {
        return;
      }

      this.load.off(Phaser.Loader.Events.COMPLETE, onComplete);
      this.clearObjects(this.setupObjects);
      this.showToast('No se pudo cargar la imagen', '#9d0208');
      if (this.textures.exists(sourceKey)) {
        this.textures.remove(sourceKey);
      }
      this.createSetupUI();
    };

    this.load.image(sourceKey, this.pendingImage.url);
    this.load.once(Phaser.Loader.Events.COMPLETE, onComplete);
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
    this.load.start();
  }

  buildPuzzle(sourceKey) {
    this.mode = 'playing';
    this.cleanupPuzzleBoard();

    this.currentSourceKey = sourceKey;

    const { width, height } = this.scale;

    const homeBtn = this.createButton({
      x: 88,
      y: 42,
      width: 150,
      height: 42,
      label: 'Inicio',
      color: 0x5f6caf,
      onClick: () => this.scene.start('Home')
    });
    this.gameObjects.push(homeBtn.container);

    const configBtn = this.createButton({
      x: width - 132,
      y: 42,
      width: 220,
      height: 42,
      label: 'Configurar',
      color: 0x4cc9f0,
      onClick: () => this.createSetupUI()
    });
    this.gameObjects.push(configBtn.container);

    const title = this.add
      .text(width * 0.5, 44, 'Puzzle en marcha', {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#254441',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.gameObjects.push(title);

    const info = this.add
      .text(width * 0.5, 82, `${this.selectedOption.label} | ${this.pendingImage.label}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#2b2d42'
      })
      .setOrigin(0.5);
    this.gameObjects.push(info);

    const texture = this.textures.get(sourceKey);
    const sourceImage = texture?.getSourceImage();
    if (!sourceImage) {
      this.showToast('No se pudo preparar el puzzle', '#9d0208');
      this.createSetupUI();
      return;
    }

    const rawWidth = sourceImage.naturalWidth || sourceImage.videoWidth || sourceImage.width;
    const rawHeight = sourceImage.naturalHeight || sourceImage.videoHeight || sourceImage.height;
    const { cols, rows } = this.selectedOption;

    const tileWidth = Math.floor(rawWidth / cols);
    const tileHeight = Math.floor(rawHeight / rows);
    if (tileWidth < 2 || tileHeight < 2) {
      this.showToast('Imagen demasiado pequena para ese numero de piezas', '#9d0208');
      this.createSetupUI();
      return;
    }

    const totalPieces = cols * rows;
    const trayCols = cols;
    const trayRows = Math.ceil(totalPieces / trayCols);

    const maxTileWidth = (width * 0.86) / cols;
    const maxTileHeight = (height - 220) / (rows + trayRows);
    const scaleFactor = Math.min(maxTileWidth / tileWidth, maxTileHeight / tileHeight);

    const displayTileWidth = tileWidth * scaleFactor;
    const displayTileHeight = tileHeight * scaleFactor;

    const boardTop = 112;
    const boardStartX = (width - cols * displayTileWidth) * 0.5;
    const trayTop = boardTop + rows * displayTileHeight + 44;
    const trayStartX = boardStartX;

    this.snapDistance = Math.max(22, Math.min(displayTileWidth, displayTileHeight) * 0.36);

    const slots = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = boardStartX + col * displayTileWidth + displayTileWidth * 0.5;
        const y = boardTop + row * displayTileHeight + displayTileHeight * 0.5;

        const slot = this.add
          .rectangle(x, y, displayTileWidth - 2, displayTileHeight - 2, 0xffffff, 0.16)
          .setStrokeStyle(2, 0x5c677d, 0.45);
        this.gameObjects.push(slot);
        slots.push({ x, y });
      }
    }

    const trayPositions = [];
    for (let row = 0; row < trayRows; row += 1) {
      for (let col = 0; col < trayCols; col += 1) {
        const index = row * trayCols + col;
        if (index >= totalPieces) {
          continue;
        }

        trayPositions.push({
          x: trayStartX + col * displayTileWidth + displayTileWidth * 0.5,
          y: trayTop + row * displayTileHeight + displayTileHeight * 0.5
        });
      }
    }
    Phaser.Utils.Array.Shuffle(trayPositions);

    const guide = this.add
      .text(width * 0.5, trayTop - 20, 'Arrastra cada pieza a su sitio correcto', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#3a506b'
      })
      .setOrigin(0.5);
    this.gameObjects.push(guide);

    this.pieces = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col;
        const pieceTextureKey = `puzzle-piece-${Date.now()}-${index}`;
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = tileWidth;
        pieceCanvas.height = tileHeight;
        const context = pieceCanvas.getContext('2d');

        context.drawImage(sourceImage, col * tileWidth, row * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);

        if (this.textures.exists(pieceTextureKey)) {
          this.textures.remove(pieceTextureKey);
        }
        this.textures.addCanvas(pieceTextureKey, pieceCanvas);
        this.dynamicTextureKeys.push(pieceTextureKey);

        const startPos = trayPositions[index];
        const sprite = this.add.image(startPos.x, startPos.y, pieceTextureKey);
        sprite.setDisplaySize(displayTileWidth - 2, displayTileHeight - 2);
        sprite.setDepth(5);
        sprite.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(sprite);
        this.gameObjects.push(sprite);

        const pieceData = {
          sprite,
          locked: false,
          targetX: slots[index].x,
          targetY: slots[index].y,
          startX: sprite.x,
          startY: sprite.y
        };

        sprite.setData('pieceData', pieceData);
        this.pieces.push(pieceData);
      }
    }
  }

  onDragStart(pointer, gameObject) {
    if (this.mode !== 'playing') {
      return;
    }

    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked) {
      return;
    }

    piece.startX = gameObject.x;
    piece.startY = gameObject.y;
    gameObject.setDepth(20);
  }

  onDrag(pointer, gameObject, dragX, dragY) {
    if (this.mode !== 'playing') {
      return;
    }

    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked) {
      return;
    }

    gameObject.x = dragX;
    gameObject.y = dragY;
  }

  onDragEnd(pointer, gameObject) {
    if (this.mode !== 'playing') {
      return;
    }

    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked) {
      return;
    }

    gameObject.setDepth(5);
    const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, piece.targetX, piece.targetY);

    if (distance <= this.snapDistance) {
      piece.locked = true;
      piece.startX = piece.targetX;
      piece.startY = piece.targetY;
      gameObject.disableInteractive();
      // Snap exacto al hueco: la pieza se coloca en la posición del slot, no donde se soltó
      this.tweens.add({
        targets: gameObject,
        x: piece.targetX,
        y: piece.targetY,
        duration: 120,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          gameObject.setPosition(piece.targetX, piece.targetY);
        }
      });

      this.checkVictory();
      return;
    }

    this.tweens.add({
      targets: gameObject,
      x: piece.startX,
      y: piece.startY,
      duration: 180,
      ease: 'Cubic.easeOut'
    });
  }

  checkVictory() {
    if (this.pieces.length === 0 || !this.pieces.every((piece) => piece.locked)) {
      return;
    }

    const { width, height } = this.scale;
    const shade = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x000000, 0.38).setDepth(40);
    const panel = this.add.rectangle(width * 0.5, height * 0.5, 560, 280, 0xffffff, 0.97).setStrokeStyle(4, 0x2a9d8f, 1).setDepth(41);
    const text = this.add
      .text(width * 0.5, height * 0.44, 'Muy bien!\nPuzzle completado', {
        align: 'center',
        fontFamily: 'Trebuchet MS',
        fontSize: '44px',
        color: '#1f7a8c',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(41);

    const againBtn = this.createButton({
      x: width * 0.42,
      y: height * 0.58,
      width: 220,
      height: 52,
      label: 'Otro puzzle',
      color: 0x2a9d8f,
      onClick: () => this.createSetupUI()
    });
    againBtn.container.setDepth(41);

    const homeBtn = this.createButton({
      x: width * 0.58,
      y: height * 0.58,
      width: 220,
      height: 52,
      label: 'Inicio',
      color: 0x5f6caf,
      onClick: () => this.scene.start('Home')
    });
    homeBtn.container.setDepth(41);

    this.gameObjects.push(shade, panel, text, againBtn.container, homeBtn.container);
  }

  cleanupPuzzleBoard() {
    this.clearObjects(this.gameObjects);
    this.pieces = [];

    this.dynamicTextureKeys.forEach((key) => {
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
    });
    this.dynamicTextureKeys = [];

    if (this.currentSourceKey && this.textures.exists(this.currentSourceKey)) {
      this.textures.remove(this.currentSourceKey);
    }
    this.currentSourceKey = null;
  }

  clearObjects(objects) {
    objects.forEach((entry) => {
      if (entry && typeof entry.destroy === 'function') {
        entry.destroy();
      }
    });
    objects.length = 0;
  }

  showToast(message, color = '#264653') {
    this.toastText?.destroy();
    this.toastText = this.add
      .text(this.scale.width * 0.5, this.scale.height - 20, message, {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color
      })
      .setOrigin(0.5, 1)
      .setDepth(60);

    this.time.delayedCall(2200, () => {
      this.toastText?.destroy();
      this.toastText = null;
    });
  }

  getLastSavedImage() {
    try {
      const dataUrl = localStorage.getItem(LAST_IMAGE_STORAGE_KEY);
      const name = localStorage.getItem(LAST_IMAGE_NAME_KEY);
      if (!dataUrl) {
        return null;
      }

      return { dataUrl, name };
    } catch {
      return null;
    }
  }

  saveLastImage(dataUrl, name) {
    try {
      localStorage.setItem(LAST_IMAGE_STORAGE_KEY, dataUrl);
      localStorage.setItem(LAST_IMAGE_NAME_KEY, name);
    } catch {
      this.showToast('No se pudo guardar la imagen en localStorage', '#9d0208');
    }
  }
}
