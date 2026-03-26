import Phaser from 'phaser';

export default class PuzzleGameScene extends Phaser.Scene {
  constructor() {
    super('PuzzleGame');

    this.imageUrl = '';
    this.imageLabel = 'Imagen';
    this.cols = 3;
    this.rows = 2;
    this.sourceTextureKey = '';
    this.loadFailed = false;
    this.snapDistance = 40;
    this.sceneObjects = [];
    this.pieces = [];
    this.dynamicTextureKeys = [];
    this.completed = false;
    this.hintVisible = false;
    this.hintElements = [];
    this.onToggleHintHandler = null;
  }

  init(data) {
    this.imageUrl = data?.imageUrl ?? '';
    this.imageLabel = data?.imageLabel ?? 'Imagen';
    this.cols = Number(data?.cols) || 3;
    this.rows = Number(data?.rows) || 2;
    this.sourceTextureKey = `puzzle-source-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.loadFailed = false;
    this.snapDistance = 40;
    this.sceneObjects = [];
    this.pieces = [];
    this.dynamicTextureKeys = [];
    this.completed = false;
    this.hintVisible = false;
    this.hintElements = [];
    this.onToggleHintHandler = null;
  }

  preload() {
    if (!this.imageUrl) {
      this.loadFailed = true;
      return;
    }

    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
      if (file?.key === this.sourceTextureKey) {
        this.loadFailed = true;
      }
    });

    this.load.image(this.sourceTextureKey, this.imageUrl);
  }

  create() {
    if (this.loadFailed) {
      this.emitExit('setup', 'error');
      return;
    }

    const { width, height } = this.scale;

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfff4cc);
    this.add.rectangle(width * 0.5, height * 0.75, width, height * 0.55, 0xcaf0f8, 0.42);

    this.input.on('dragstart', this.onDragStart, this);
    this.input.on('drag', this.onDrag, this);
    this.input.on('dragend', this.onDragEnd, this);
    this.events.once('shutdown', this.onShutdown, this);

    this.onToggleHintHandler = () => this.toggleHint();
    this.game.events.on('togglePuzzleHint', this.onToggleHintHandler);
    this.game.events.emit('puzzleHintStateChanged', { enabled: false });

    this.buildPuzzle();
  }

  onShutdown() {
    this.input.off('dragstart', this.onDragStart, this);
    this.input.off('drag', this.onDrag, this);
    this.input.off('dragend', this.onDragEnd, this);

    if (this.onToggleHintHandler) {
      this.game.events.off('togglePuzzleHint', this.onToggleHintHandler);
      this.onToggleHintHandler = null;
    }

    this.game.events.emit('puzzleHintStateChanged', { enabled: false });
    this.cleanupPuzzleBoard();
  }

  buildPuzzle() {
    const texture = this.textures.get(this.sourceTextureKey);
    const sourceImage = texture?.getSourceImage();
    if (!sourceImage) {
      this.emitExit('setup', 'error');
      return;
    }

    const { width, height } = this.scale;
    const rawWidth = sourceImage.naturalWidth || sourceImage.videoWidth || sourceImage.width;
    const rawHeight = sourceImage.naturalHeight || sourceImage.videoHeight || sourceImage.height;

    const tileWidth = Math.floor(rawWidth / this.cols);
    const tileHeight = Math.floor(rawHeight / this.rows);
    if (tileWidth < 2 || tileHeight < 2) {
      this.emitExit('setup', 'error');
      return;
    }

    const title = this.add
      .text(width * 0.5, 36, 'Puzzle en marcha', {
        fontFamily: 'Trebuchet MS',
        fontSize: '38px',
        color: '#254441',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(title);

    const info = this.add
      .text(width * 0.5, 68, `${this.cols}x${this.rows} | ${this.imageLabel}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '21px',
        color: '#2b2d42'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(info);

    const totalPieces = this.cols * this.rows;
    const trayCols = this.cols;
    const trayRows = Math.ceil(totalPieces / trayCols);
    const isDesktop = width >= 1100;
    const verticalGap = isDesktop ? 10 : 16;
    const boardTop = isDesktop ? 56 : 74;
    const usableWidth = width * (isDesktop ? 0.975 : 0.93);
    const usableHeight = height - (isDesktop ? 88 : 116);
    const scaleFactor = Math.min(
      usableWidth / (this.cols * tileWidth),
      (usableHeight - verticalGap) / ((this.rows + trayRows) * tileHeight)
    );

    const displayTileWidth = tileWidth * scaleFactor;
    const displayTileHeight = tileHeight * scaleFactor;
    const pieceInset = isDesktop ? 2 : 2;
    const boardStartX = (width - this.cols * displayTileWidth) * 0.5;
    const trayTop = boardTop + this.rows * displayTileHeight + verticalGap;
    const trayStartX = boardStartX;

    this.snapDistance = Math.max(22, Math.min(displayTileWidth, displayTileHeight) * 0.36);

    const slots = [];
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const x = boardStartX + col * displayTileWidth + displayTileWidth * 0.5;
        const y = boardTop + row * displayTileHeight + displayTileHeight * 0.5;
        const edgeInfo = this.getEdgeInfo(row, col);
        const fillAlpha = edgeInfo.isCorner ? 0.24 : edgeInfo.isEdge ? 0.18 : 0.12;

        const slot = this.add
          .rectangle(x, y, displayTileWidth - pieceInset, displayTileHeight - pieceInset, 0xffffff, fillAlpha)
          .setStrokeStyle(2, 0x5c677d, edgeInfo.isEdge ? 0.5 : 0.42);
        this.sceneObjects.push(slot);

        if (edgeInfo.isEdge) {
          this.sceneObjects.push(
            this.createSlotEdgeGuide(x, y, displayTileWidth - pieceInset, displayTileHeight - pieceInset, edgeInfo)
          );
        }

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
      .text(width * 0.5, trayTop - Math.max(14, verticalGap * 0.45), 'Las piezas de borde llevan marco solo en sus lados exteriores para formar el contorno.', {
        fontFamily: 'Trebuchet MS',
        fontSize: isDesktop ? '18px' : '16px',
        color: '#3a506b',
        align: 'center'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(guide);

    this.createHintOverlay(rawWidth, rawHeight);

    const runToken = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const index = row * this.cols + col;
        const pieceTextureKey = `puzzle-piece-${runToken}-${index}`;
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = tileWidth;
        pieceCanvas.height = tileHeight;
        const context = pieceCanvas.getContext('2d');
        if (!context) {
          continue;
        }

        const edgeInfo = this.getEdgeInfo(row, col);
        context.drawImage(sourceImage, col * tileWidth, row * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
        this.decorateEdgePiece(context, tileWidth, tileHeight, edgeInfo);

        if (this.textures.exists(pieceTextureKey)) {
          this.textures.remove(pieceTextureKey);
        }
        this.textures.addCanvas(pieceTextureKey, pieceCanvas);
        this.dynamicTextureKeys.push(pieceTextureKey);

        const startPos = trayPositions[index];
        const sprite = this.add.image(startPos.x, startPos.y, pieceTextureKey);
        sprite.setDisplaySize(displayTileWidth - pieceInset, displayTileHeight - pieceInset);
        sprite.setDepth(5);
        sprite.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(sprite);
        this.sceneObjects.push(sprite);

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

  getEdgeInfo(row, col) {
    const isTop = row === 0;
    const isBottom = row === this.rows - 1;
    const isLeft = col === 0;
    const isRight = col === this.cols - 1;
    const isEdge = isTop || isBottom || isLeft || isRight;
    const isCorner = (isTop || isBottom) && (isLeft || isRight);

    return { isTop, isBottom, isLeft, isRight, isEdge, isCorner };
  }

  decorateEdgePiece(context, tileWidth, tileHeight, edgeInfo) {
    if (!edgeInfo.isEdge) {
      return;
    }

    const inset = Math.max(6, Math.round(Math.min(tileWidth, tileHeight) * 0.06));
    const accent = edgeInfo.isCorner ? '#f77f00' : '#ffb703';
    const outerLine = edgeInfo.isCorner ? 16 : 12;
    const innerLine = edgeInfo.isCorner ? 9 : 7;

    context.save();
    context.lineCap = 'square';
    context.lineJoin = 'round';
    this.drawEdgeFrameSegments(context, tileWidth, tileHeight, inset, edgeInfo, 'rgba(255,255,255,0.98)', outerLine);
    this.drawEdgeFrameSegments(context, tileWidth, tileHeight, inset, edgeInfo, accent, innerLine);
    context.restore();
  }

  drawEdgeFrameSegments(context, tileWidth, tileHeight, inset, edgeInfo, strokeStyle, lineWidth) {
    const left = inset;
    const right = tileWidth - inset;
    const top = inset;
    const bottom = tileHeight - inset;

    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.beginPath();

    if (edgeInfo.isTop) {
      context.moveTo(left, top);
      context.lineTo(right, top);
    }

    if (edgeInfo.isRight) {
      context.moveTo(right, top);
      context.lineTo(right, bottom);
    }

    if (edgeInfo.isBottom) {
      context.moveTo(right, bottom);
      context.lineTo(left, bottom);
    }

    if (edgeInfo.isLeft) {
      context.moveTo(left, bottom);
      context.lineTo(left, top);
    }

    context.stroke();
  }

  createSlotEdgeGuide(x, y, width, height, edgeInfo) {
    const guide = this.add.graphics();
    const accent = edgeInfo.isCorner ? 0xf77f00 : 0xffb703;
    const outerWidth = edgeInfo.isCorner ? 8 : 6;
    const innerWidth = edgeInfo.isCorner ? 4 : 3;
    const left = x - width * 0.5;
    const right = x + width * 0.5;
    const top = y - height * 0.5;
    const bottom = y + height * 0.5;

    this.drawSlotEdgeSegments(guide, left, top, right, bottom, edgeInfo, 0xffffff, outerWidth, 0.96);
    this.drawSlotEdgeSegments(guide, left, top, right, bottom, edgeInfo, accent, innerWidth, 0.95);

    return guide;
  }

  drawSlotEdgeSegments(graphics, left, top, right, bottom, edgeInfo, color, lineWidth, alpha) {
    graphics.lineStyle(lineWidth, color, alpha);

    if (edgeInfo.isTop) {
      graphics.lineBetween(left, top, right, top);
    }

    if (edgeInfo.isRight) {
      graphics.lineBetween(right, top, right, bottom);
    }

    if (edgeInfo.isBottom) {
      graphics.lineBetween(right, bottom, left, bottom);
    }

    if (edgeInfo.isLeft) {
      graphics.lineBetween(left, bottom, left, top);
    }
  }

  createHintOverlay(rawWidth, rawHeight) {
    this.destroyHintOverlay();

    const { width, height } = this.scale;
    const maxPreviewWidth = width >= 1100 ? width * 0.62 : width * 0.82;
    const maxPreviewHeight = width >= 1100 ? height * 0.64 : height * 0.54;
    const previewScale = Math.min(maxPreviewWidth / rawWidth, maxPreviewHeight / rawHeight);
    const previewWidth = rawWidth * previewScale;
    const previewHeight = rawHeight * previewScale;

    const shade = this.add
      .rectangle(width * 0.5, height * 0.5, width, height, 0x0b1d2a, 0.56)
      .setDepth(45)
      .setScrollFactor(0)
      .setVisible(false);
    shade.setInteractive({ cursor: 'pointer' });
    shade.on('pointerup', () => this.setHintVisible(false));

    const panel = this.add
      .rectangle(width * 0.5, height * 0.5, previewWidth + 52, previewHeight + 94, 0xfffbf0, 0.98)
      .setStrokeStyle(4, 0x1d3557, 0.95)
      .setDepth(46)
      .setVisible(false);

    const title = this.add
      .text(width * 0.5, height * 0.5 - previewHeight * 0.5 - 18, 'Imagen completa', {
        fontFamily: 'Trebuchet MS',
        fontSize: '28px',
        color: '#1d3557',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(47)
      .setVisible(false);

    const preview = this.add
      .image(width * 0.5, height * 0.5 + 8, this.sourceTextureKey)
      .setDisplaySize(previewWidth, previewHeight)
      .setDepth(47)
      .setVisible(false);

    const note = this.add
      .text(width * 0.5, height * 0.5 + previewHeight * 0.5 + 26, 'Pulsa de nuevo el boton Hint para seguir jugando.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#355070'
      })
      .setOrigin(0.5)
      .setDepth(47)
      .setVisible(false);

    this.hintElements = [shade, panel, title, preview, note];
  }

  destroyHintOverlay() {
    this.hintElements.forEach((entry) => entry?.destroy());
    this.hintElements = [];
    this.hintVisible = false;
  }

  toggleHint() {
    if (this.hintElements.length === 0 || this.completed) {
      return;
    }

    this.setHintVisible(!this.hintVisible);
  }

  setHintVisible(visible) {
    this.hintVisible = Boolean(visible) && !this.completed && this.hintElements.length > 0;
    this.hintElements.forEach((entry) => entry.setVisible(this.hintVisible));
    this.game.events.emit('puzzleHintStateChanged', { enabled: this.hintVisible });
  }

  onDragStart(pointer, gameObject) {
    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked || this.completed || this.hintVisible) {
      return;
    }

    piece.startX = gameObject.x;
    piece.startY = gameObject.y;
    gameObject.setDepth(20);
  }

  onDrag(pointer, gameObject, dragX, dragY) {
    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked || this.completed || this.hintVisible) {
      return;
    }

    gameObject.x = dragX;
    gameObject.y = dragY;
  }

  onDragEnd(pointer, gameObject) {
    const piece = gameObject.getData('pieceData');
    if (!piece || piece.locked || this.completed || this.hintVisible) {
      return;
    }

    gameObject.setDepth(5);
    const distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, piece.targetX, piece.targetY);

    if (distance <= this.snapDistance) {
      piece.locked = true;
      piece.startX = piece.targetX;
      piece.startY = piece.targetY;
      gameObject.disableInteractive();
      this.tweens.add({
        targets: gameObject,
        x: piece.targetX,
        y: piece.targetY,
        duration: 120,
        ease: 'Cubic.easeOut'
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
    if (this.completed || this.pieces.length === 0 || !this.pieces.every((piece) => piece.locked)) {
      return;
    }

    this.completed = true;
    this.setHintVisible(false);
    const sprites = this.pieces.map((piece) => piece.sprite);
    this.tweens.add({
      targets: sprites,
      alpha: 0.8,
      yoyo: true,
      duration: 140
    });

    this.time.delayedCall(260, () => {
      this.emitExit('setup', 'victory');
    });
  }

  emitExit(to, reason = 'nav') {
    this.game.events.emit('exitToMenu', {
      game: 'puzzle',
      to,
      reason
    });
  }

  cleanupPuzzleBoard() {
    this.destroyHintOverlay();
    this.clearObjects(this.sceneObjects);
    this.pieces = [];

    this.dynamicTextureKeys.forEach((key) => {
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
    });
    this.dynamicTextureKeys = [];

    if (this.sourceTextureKey && this.textures.exists(this.sourceTextureKey)) {
      this.textures.remove(this.sourceTextureKey);
    }
    this.sourceTextureKey = '';
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
