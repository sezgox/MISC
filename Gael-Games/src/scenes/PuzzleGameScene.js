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
    this.onResizeHandler = null;
    this.backgroundTop = null;
    this.backgroundBottom = null;
    this.titleText = null;
    this.infoText = null;
    this.guideText = null;
    this.slotRects = [];
    this.slotGuides = [];
    this.rawImageSize = null;
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
    this.onResizeHandler = null;
    this.backgroundTop = null;
    this.backgroundBottom = null;
    this.titleText = null;
    this.infoText = null;
    this.guideText = null;
    this.slotRects = [];
    this.slotGuides = [];
    this.rawImageSize = null;
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

    this.backgroundTop = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0xfff4cc);
    this.backgroundBottom = this.add.rectangle(width * 0.5, height * 0.75, width, height * 0.55, 0xcaf0f8, 0.42);
    this.sceneObjects.push(this.backgroundTop, this.backgroundBottom);

    this.input.on('dragstart', this.onDragStart, this);
    this.input.on('drag', this.onDrag, this);
    this.input.on('dragend', this.onDragEnd, this);
    this.events.once('shutdown', this.onShutdown, this);

    this.onToggleHintHandler = () => this.toggleHint();
    this.game.events.on('togglePuzzleHint', this.onToggleHintHandler);
    this.game.events.emit('puzzleHintStateChanged', { enabled: false });
    this.onResizeHandler = () => this.layoutPuzzleBoard();
    this.scale.on('resize', this.onResizeHandler);

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
    if (this.onResizeHandler) {
      this.scale.off('resize', this.onResizeHandler);
      this.onResizeHandler = null;
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
    this.rawImageSize = { width: rawWidth, height: rawHeight };

    const tileWidth = Math.floor(rawWidth / this.cols);
    const tileHeight = Math.floor(rawHeight / this.rows);
    if (tileWidth < 2 || tileHeight < 2) {
      this.emitExit('setup', 'error');
      return;
    }

    this.titleText = this.add
      .text(width * 0.5, 40, 'Puzzle en marcha', {
        fontFamily: 'Trebuchet MS',
        fontSize: '36px',
        color: '#254441',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.titleText);

    this.infoText = this.add
      .text(width * 0.5, 74, `${this.cols}x${this.rows} | ${this.imageLabel}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#2b2d42'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.infoText);

    const totalPieces = this.cols * this.rows;
    const trayOrder = Phaser.Utils.Array.Shuffle(Array.from({ length: totalPieces }, (_, index) => index));

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const edgeInfo = this.getEdgeInfo(row, col);
        const fillAlpha = edgeInfo.isCorner ? 0.24 : edgeInfo.isEdge ? 0.18 : 0.12;
        const slot = this.add.rectangle(0, 0, 10, 10, 0xffffff, fillAlpha);
        slot.setStrokeStyle(2, 0x5c677d, edgeInfo.isEdge ? 0.5 : 0.42);
        this.slotRects.push(slot);
        this.sceneObjects.push(slot);

        const slotGuide = edgeInfo.isEdge ? this.createSlotEdgeGuide(0, 0, 10, 10, edgeInfo) : null;
        if (slotGuide) {
          this.slotGuides.push(slotGuide);
          this.sceneObjects.push(slotGuide);
        } else {
          this.slotGuides.push(null);
        }
      }
    }

    this.guideText = this.add
      .text(0, 0, 'Las piezas de borde llevan marco solo en sus lados exteriores para formar el contorno.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '16px',
        color: '#3a506b',
        align: 'center'
      })
      .setOrigin(0.5);
    this.sceneObjects.push(this.guideText);

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

        const sprite = this.add.image(width * 0.5, height * 0.5, pieceTextureKey);
        sprite.setDepth(5);
        sprite.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(sprite);
        this.sceneObjects.push(sprite);

        const pieceData = {
          sprite,
          locked: false,
          index,
          trayIndex: trayOrder[index],
          targetX: width * 0.5,
          targetY: height * 0.5,
          startX: sprite.x,
          startY: sprite.y
        };

        sprite.setData('pieceData', pieceData);
        this.pieces.push(pieceData);
      }
    }

    this.layoutPuzzleBoard();
  }

  getPuzzleLayoutMetrics(tileWidth, tileHeight) {
    const { width, height } = this.scale;
    const totalPieces = this.cols * this.rows;
    const isDesktop = width >= 1100;
    const isPortrait = height > width;
    const trayCols = isDesktop
      ? totalPieces <= 8
        ? totalPieces
        : Math.min(totalPieces, Math.max(this.cols * 2, 8))
      : isPortrait
        ? this.cols
        : Math.min(totalPieces, Math.max(this.cols + 1, 4));
    const trayRows = Math.ceil(totalPieces / trayCols);
    const titleSize = isDesktop ? 34 : isPortrait ? 22 : 28;
    const infoSize = isDesktop ? 19 : isPortrait ? 14 : 16;
    const guideSize = isDesktop ? 15 : isPortrait ? 12 : 13;
    const overlayReserve = isDesktop ? 8 : isPortrait ? 80 : 36;
    const titleY = overlayReserve + titleSize * 0.62;
    const infoY = titleY + titleSize * 0.72 + 6;
    const boardTop = infoY + infoSize * 0.72 + (isDesktop ? 10 : 12);
    const sidePadding = isDesktop ? 10 : isPortrait ? 12 : 14;
    const bottomPadding = isDesktop ? 10 : isPortrait ? 16 : 14;
    const guideGap = isDesktop ? 12 : 10;
    const trayGap = isDesktop ? 16 : 12;
    const verticalGap = isDesktop ? 10 : isPortrait ? 8 : 10;
    const footprintCols = Math.max(this.cols, trayCols);
    const usableWidth = Math.max(300, width - sidePadding * 2);
    const usableHeight = Math.max(280, height - boardTop - bottomPadding);
    const scaleFactor = Math.min(
      usableWidth / (footprintCols * tileWidth),
      (usableHeight - guideGap - trayGap) / ((this.rows + trayRows) * tileHeight)
    );
    const displayTileWidth = tileWidth * scaleFactor;
    const displayTileHeight = tileHeight * scaleFactor;
    const pieceInset = 2;
    const boardWidth = this.cols * displayTileWidth;
    const boardHeight = this.rows * displayTileHeight;
    const trayWidth = trayCols * displayTileWidth;
    const boardStartX = (width - boardWidth) * 0.5;
    const boardStartY = boardTop;
    const guideY = boardStartY + boardHeight + guideGap;
    const trayTop = guideY + guideSize * 0.85 + trayGap;
    const trayStartX = (width - trayWidth) * 0.5;

    return {
      width,
      height,
      trayCols,
      trayRows,
      titleSize,
      infoSize,
      guideSize,
      titleY,
      infoY,
      guideY,
      boardStartX,
      boardStartY,
      trayStartX,
      trayTop,
      displayTileWidth,
      displayTileHeight,
      pieceInset,
      verticalGap,
      boardHeight
    };
  }

  layoutPuzzleBoard() {
    if (!this.rawImageSize || !this.titleText || !this.infoText || !this.guideText) {
      return;
    }

    const tileWidth = Math.floor(this.rawImageSize.width / this.cols);
    const tileHeight = Math.floor(this.rawImageSize.height / this.rows);
    const metrics = this.getPuzzleLayoutMetrics(tileWidth, tileHeight);
    const {
      width,
      height,
      trayCols,
      titleSize,
      infoSize,
      guideSize,
      titleY,
      infoY,
      guideY,
      boardStartX,
      boardStartY,
      trayStartX,
      trayTop,
      displayTileWidth,
      displayTileHeight,
      pieceInset,
      verticalGap,
      boardHeight
    } = metrics;

    this.snapDistance = Math.max(24, Math.min(displayTileWidth, displayTileHeight) * 0.34);

    this.backgroundTop.setPosition(width * 0.5, height * 0.5);
    this.backgroundTop.setSize(width, height);
    this.backgroundBottom.setPosition(width * 0.5, height - Math.max(height * 0.24, boardHeight * 0.42));
    this.backgroundBottom.setSize(width, Math.max(height * 0.34, boardHeight * 0.82));

    this.titleText.setPosition(width * 0.5, titleY).setStyle({ fontSize: `${Math.round(titleSize)}px` });
    this.infoText.setPosition(width * 0.5, infoY).setStyle({ fontSize: `${Math.round(infoSize)}px` });
    this.guideText.setPosition(width * 0.5, guideY).setStyle({ fontSize: `${Math.round(guideSize)}px` });

    const slotPositions = [];
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const index = row * this.cols + col;
        const x = boardStartX + col * displayTileWidth + displayTileWidth * 0.5;
        const y = boardStartY + row * displayTileHeight + displayTileHeight * 0.5;
        const slot = this.slotRects[index];
        slot.setPosition(x, y);
        slot.setSize(displayTileWidth - pieceInset, displayTileHeight - pieceInset);
        slotPositions.push({ x, y });

        const slotGuide = this.slotGuides[index];
        if (slotGuide) {
          slotGuide.clear();
          this.drawSlotEdgeSegments(
            slotGuide,
            x - (displayTileWidth - pieceInset) * 0.5,
            y - (displayTileHeight - pieceInset) * 0.5,
            x + (displayTileWidth - pieceInset) * 0.5,
            y + (displayTileHeight - pieceInset) * 0.5,
            this.getEdgeInfo(row, col),
            0xffffff,
            this.getEdgeInfo(row, col).isCorner ? 8 : 6,
            0.96
          );
          this.drawSlotEdgeSegments(
            slotGuide,
            x - (displayTileWidth - pieceInset) * 0.5,
            y - (displayTileHeight - pieceInset) * 0.5,
            x + (displayTileWidth - pieceInset) * 0.5,
            y + (displayTileHeight - pieceInset) * 0.5,
            this.getEdgeInfo(row, col),
            this.getEdgeInfo(row, col).isCorner ? 0xf77f00 : 0xffb703,
            this.getEdgeInfo(row, col).isCorner ? 4 : 3,
            0.95
          );
        }
      }
    }

    const trayPositions = [];
    for (let row = 0; row < Math.ceil(this.pieces.length / trayCols); row += 1) {
      for (let col = 0; col < trayCols; col += 1) {
        const index = row * trayCols + col;
        if (index >= this.pieces.length) {
          continue;
        }
        trayPositions.push({
          x: trayStartX + col * displayTileWidth + displayTileWidth * 0.5,
          y: trayTop + row * displayTileHeight + displayTileHeight * 0.5
        });
      }
    }

    this.pieces.forEach((piece) => {
      const target = slotPositions[piece.index];
      const tray = trayPositions[piece.trayIndex];
      piece.targetX = target.x;
      piece.targetY = target.y;
      piece.sprite.setDisplaySize(displayTileWidth - pieceInset, displayTileHeight - pieceInset);

      if (piece.locked) {
        piece.startX = target.x;
        piece.startY = target.y;
        piece.sprite.setPosition(target.x, target.y);
      } else {
        piece.startX = tray.x;
        piece.startY = tray.y;
        piece.sprite.setPosition(tray.x, tray.y);
      }
    });
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
