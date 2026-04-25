import Phaser from 'phaser';
import './styles.css';
import BootScene from './scenes/BootScene';
import PuzzleGameScene from './scenes/PuzzleGameScene';
import MemoryGameScene from './scenes/MemoryGameScene';
import QuizGameScene from './scenes/QuizGameScene';
import { initApp } from './ui/app';

let appUi = null;
let memoryAssetsReady = false;
const GAME_BASE_WIDTH = 1280;
const GAME_BASE_HEIGHT = 720;

function getGameContainerOverlayTopPx() {
  const gameContainer = document.getElementById('game-container');
  const gameOverlay = document.getElementById('game-overlay');
  if (!gameContainer || !gameOverlay) {
    return 0;
  }
  if (gameContainer.classList.contains('game-shell-hidden') || gameOverlay.classList.contains('view-hidden')) {
    return 0;
  }
  const bar = gameOverlay.querySelector('.overlay-bar');
  if (!bar) {
    return 0;
  }
  const h = bar.getBoundingClientRect().height;
  return h > 0 ? Math.ceil(h) + 10 : 0;
}

function updateGameOverlayPadding() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    return;
  }
  if (gameContainer.classList.contains('game-shell-hidden')) {
    gameContainer.style.paddingTop = '';
    return;
  }
  const topPx = getGameContainerOverlayTopPx();
  if (topPx > 0) {
    gameContainer.style.paddingTop = `${topPx}px`;
  } else {
    gameContainer.style.paddingTop = '';
  }
}

function readViewportSize() {
  const appRoot = document.getElementById('app');
  const gameContainer = document.getElementById('game-container');
  const fallbackWidth = window.innerWidth || GAME_BASE_WIDTH;
  const fallbackHeight = window.innerHeight || GAME_BASE_HEIGHT;
  const width = Math.max(320, Math.round(appRoot?.clientWidth || fallbackWidth));
  let height = Math.max(240, Math.round(appRoot?.clientHeight || fallbackHeight));
  if (gameContainer && !gameContainer.classList.contains('game-shell-hidden')) {
    const pt = gameContainer.style.paddingTop;
    if (pt) {
      const n = parseInt(pt, 10);
      if (!Number.isNaN(n) && n > 0) {
        height = Math.max(240, height - n);
      }
    }
  }

  return { width, height };
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#fff5d6',
  width: GAME_BASE_WIDTH,
  height: GAME_BASE_HEIGHT,
  dom: {
    createContainer: true
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_BASE_WIDTH,
    height: GAME_BASE_HEIGHT
  },
  scene: [BootScene, PuzzleGameScene, MemoryGameScene, QuizGameScene]
};

const game = new Phaser.Game(config);

function syncGameViewport() {
  updateGameOverlayPadding();
  void document.getElementById('game-container')?.offsetHeight;
  const { width, height } = readViewportSize();
  if (game.scale.width === width && game.scale.height === height) {
    return;
  }

  game.scale.resize(width, height);
}

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
  if (game.scene.isActive('QuizGame')) {
    game.scene.stop('QuizGame');
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
  syncGameViewport();
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
  syncGameViewport();
  stopRunningGames();
  game.scene.start('MemoryGame', {
    themeKey,
    pairCount: numericPairCount
  });
  return true;
}

export function startQuizGame(themeKey) {
  if (!themeKey || !memoryAssetsReady) {
    return false;
  }

  closeMemoryDialog();
  appUi?.showGame('quiz');
  syncGameViewport();
  stopRunningGames();
  game.scene.start('QuizGame', { themeKey });
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
  startQuizGame,
  togglePuzzleHint,
  requestExitToMenu,
  isMemoryReady: () => memoryAssetsReady,
  onGameShellLayout: syncGameViewport
});

if (game.textures.exists('memory-card-back')) {
  memoryAssetsReady = true;
  appUi.setMemoryReady(true);
}

window.addEventListener('resize', syncGameViewport);
window.addEventListener('orientationchange', () => {
  window.setTimeout(syncGameViewport, 120);
});

syncGameViewport();
