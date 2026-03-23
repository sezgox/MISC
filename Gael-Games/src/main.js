import Phaser from 'phaser';
import './styles.css';
import BootScene from './scenes/BootScene';
import PuzzleGameScene from './scenes/PuzzleGameScene';
import MemoryGameScene from './scenes/MemoryGameScene';
import { initApp } from './ui/app';

let appUi = null;
let memoryAssetsReady = false;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#fff5d6',
  width: 1280,
  height: 720,
  dom: {
    createContainer: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [BootScene, PuzzleGameScene, MemoryGameScene]
};

const game = new Phaser.Game(config);

const memoryDialogRoot = document.getElementById('memory-pair-dialog');
const memoryDialogImage = document.getElementById('memory-dialog-image');
const memoryDialogTitle = document.getElementById('memory-dialog-title');
const memoryDialogDescription = document.getElementById('memory-dialog-description');
const memoryDialogCloseButton = document.getElementById('memory-dialog-close');

if (!memoryDialogRoot || !memoryDialogImage || !memoryDialogTitle || !memoryDialogDescription || !memoryDialogCloseButton) {
  throw new Error('No se encontro la estructura del dialogo de Memory en index.html');
}

let memoryDialogOpen = false;

const closeMemoryDialog = ({ emitEvent = false } = {}) => {
  if (!memoryDialogOpen && !emitEvent) {
    return;
  }

  memoryDialogOpen = false;
  memoryDialogRoot.classList.add('is-hidden');
  memoryDialogRoot.setAttribute('aria-hidden', 'true');

  if (emitEvent) {
    game.events.emit('memoryDialogClosed');
  }
};

const openMemoryDialog = ({ imageUrl, title, description } = {}) => {
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    memoryDialogImage.src = imageUrl;
  } else {
    memoryDialogImage.removeAttribute('src');
  }

  memoryDialogTitle.textContent = typeof title === 'string' && title.trim() ? title : 'Pareja encontrada';
  memoryDialogDescription.textContent = typeof description === 'string' ? description : '';
  memoryDialogImage.alt = memoryDialogTitle.textContent;

  memoryDialogRoot.classList.remove('is-hidden');
  memoryDialogRoot.setAttribute('aria-hidden', 'false');
  memoryDialogOpen = true;
  memoryDialogCloseButton.focus();
};

memoryDialogCloseButton.addEventListener('click', () => {
  closeMemoryDialog({ emitEvent: true });
});

const stopRunningGames = () => {
  if (game.scene.isActive('PuzzleGame')) {
    game.scene.stop('PuzzleGame');
  }
  if (game.scene.isActive('MemoryGame')) {
    game.scene.stop('MemoryGame');
  }
};

const togglePuzzleHint = () => {
  if (!game.scene.isActive('PuzzleGame')) {
    return false;
  }

  game.events.emit('togglePuzzleHint');
  return true;
};

export function startPuzzleGame(imageUrl, imageLabel, cols, rows) {
  if (!imageUrl || !Number.isFinite(cols) || !Number.isFinite(rows)) {
    return false;
  }

  closeMemoryDialog();
  appUi?.showGame('puzzle');
  stopRunningGames();
  game.scene.start('PuzzleGame', {
    imageUrl,
    imageLabel,
    cols,
    rows
  });
  return true;
}

export function startMemoryGame(themeKey, pairCount) {
  if (!themeKey || !memoryAssetsReady) {
    return false;
  }

  const numericPairCount = Number(pairCount);
  if (!Number.isFinite(numericPairCount) || numericPairCount < 8) {
    return false;
  }

  closeMemoryDialog();
  appUi?.showGame('memory');
  stopRunningGames();
  game.scene.start('MemoryGame', {
    themeKey,
    pairCount: numericPairCount
  });
  return true;
}

const requestExitToMenu = ({ game: gameKey, to }) => {
  game.events.emit('exitToMenu', {
    game: gameKey,
    to,
    reason: 'nav'
  });
};

game.events.on('memoryAssetsReady', () => {
  memoryAssetsReady = true;
  appUi?.setMemoryReady(true);
});

game.events.on('memoryPairMatched', (payload) => {
  openMemoryDialog(payload ?? {});
});

game.events.on('puzzleHintStateChanged', (payload) => {
  appUi?.setPuzzleHintEnabled(Boolean(payload?.enabled));
});

game.events.on('exitToMenu', (payload) => {
  closeMemoryDialog();
  stopRunningGames();
  appUi?.setPuzzleHintEnabled(false);
  appUi?.handleGameExit(payload ?? {});
});

appUi = initApp({
  startPuzzleGame,
  startMemoryGame,
  togglePuzzleHint,
  requestExitToMenu,
  isMemoryReady: () => memoryAssetsReady
});

if (game.textures.exists('memory-card-back')) {
  memoryAssetsReady = true;
  appUi.setMemoryReady(true);
}
