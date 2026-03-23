import { puzzleGallery } from '../games/puzzle/gallery';
import { memoryThemes } from '../games/memory/themes';

const LAST_IMAGE_STORAGE_KEY = 'gael.puzzle.lastImage';
const LAST_IMAGE_NAME_KEY = 'gael.puzzle.lastImageName';

const pieceOptions = [
  { label: '6 piezas (3x2)', cols: 3, rows: 2 },
  { label: '12 piezas (4x3)', cols: 4, rows: 3 },
  { label: '20 piezas (5x4)', cols: 5, rows: 4 }
];

function createElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (typeof textContent === 'string') {
    element.textContent = textContent;
  }
  return element;
}

function getLastSavedImage() {
  try {
    const dataUrl = localStorage.getItem(LAST_IMAGE_STORAGE_KEY);
    const name = localStorage.getItem(LAST_IMAGE_NAME_KEY);
    if (!dataUrl) {
      return null;
    }

    return { dataUrl, name: name || 'archivo' };
  } catch {
    return null;
  }
}

function saveLastImage(dataUrl, name) {
  try {
    localStorage.setItem(LAST_IMAGE_STORAGE_KEY, dataUrl);
    localStorage.setItem(LAST_IMAGE_NAME_KEY, name);
    return true;
  } catch {
    return false;
  }
}

function galleryItemToSelection(item) {
  return {
    id: `gallery-${item.id}`,
    name: item.name,
    url: item.url
  };
}

export function initApp({ startPuzzleGame, startMemoryGame, togglePuzzleHint, requestExitToMenu, isMemoryReady }) {
  const uiRoot = document.getElementById('ui');
  const gameContainer = document.getElementById('game-container');
  const gameOverlay = document.getElementById('game-overlay');
  const fileInput = document.getElementById('puzzle-file-input');

  const homeView = document.getElementById('view-home');
  const puzzleSetupView = document.getElementById('view-puzzle-setup');
  const memorySelectView = document.getElementById('view-memory-select');
  const memoryPairsDialog = document.getElementById('memory-pairs-dialog');
  const memoryPairsTheme = document.getElementById('memory-pairs-theme');
  const memoryPairsSubtitle = document.getElementById('memory-pairs-subtitle');
  const memoryPairsOptions = document.getElementById('memory-pairs-options');
  const memoryPairsCancel = document.getElementById('memory-pairs-cancel');

  if (
    !uiRoot ||
    !gameContainer ||
    !gameOverlay ||
    !fileInput ||
    !homeView ||
    !puzzleSetupView ||
    !memorySelectView ||
    !memoryPairsDialog ||
    !memoryPairsTheme ||
    !memoryPairsSubtitle ||
    !memoryPairsOptions ||
    !memoryPairsCancel
  ) {
    throw new Error('No se encontro la estructura base de la UI en index.html');
  }

  const views = {
    home: homeView,
    'puzzle-setup': puzzleSetupView,
    'memory-select': memorySelectView
  };

  const state = {
    currentView: 'home',
    activeGame: null,
    selectedPieceOption: pieceOptions[0],
    selectedImage: puzzleGallery.length > 0 ? galleryItemToSelection(puzzleGallery[0]) : null,
    puzzleHintEnabled: false,
    puzzleMessage: '',
    puzzleMessageTone: 'info',
    memoryMessage: '',
    memoryMessageTone: 'info',
    memoryReady: Boolean(isMemoryReady?.())
  };

  const getPairOptions = (cardCount) => {
    const limit = Math.max(0, Math.floor(cardCount / 4) * 4);
    const options = [];
    for (let pairCount = 8; pairCount <= limit; pairCount += 4) {
      options.push(pairCount);
    }
    return options;
  };

  const closeMemoryPairSelector = () => {
    memoryPairsDialog.classList.add('is-hidden');
    memoryPairsDialog.setAttribute('aria-hidden', 'true');
    memoryPairsTheme.textContent = 'Memory';
    memoryPairsSubtitle.textContent = 'Elige cuantos pares quieres jugar';
    memoryPairsOptions.innerHTML = '';
  };

  const openMemoryPairSelector = (theme) => {
    if (!theme) {
      return;
    }

    const options = getPairOptions(theme.cards.length);
    if (options.length === 0) {
      setMemoryMessage('Este tema no tiene suficientes cartas para iniciar.', 'error');
      return;
    }

    memoryPairsTheme.textContent = theme.name;
    memoryPairsSubtitle.textContent = `Elige cuantos pares quieres jugar (${options[0]}-${options[options.length - 1]})`;
    memoryPairsOptions.innerHTML = '';

    options.forEach((pairCount) => {
      const optionButton = createElement('button', 'pairs-option-btn', `${pairCount} pares`);
      optionButton.type = 'button';
      optionButton.addEventListener('click', () => {
        const started = startMemoryGame(theme.key, pairCount);
        if (!started) {
          setMemoryMessage('Cargando assets de Memory. Intenta de nuevo en unos segundos.', 'info');
          return;
        }

        state.memoryMessage = '';
        closeMemoryPairSelector();
      });
      memoryPairsOptions.appendChild(optionButton);
    });

    memoryPairsDialog.classList.remove('is-hidden');
    memoryPairsDialog.setAttribute('aria-hidden', 'false');
    memoryPairsOptions.querySelector('button')?.focus();
  };

  const setPuzzleMessage = (message, tone = 'info') => {
    state.puzzleMessage = message;
    state.puzzleMessageTone = tone;
    renderPuzzleSetupView();
  };

  const setMemoryMessage = (message, tone = 'info') => {
    state.memoryMessage = message;
    state.memoryMessageTone = tone;
    renderMemorySelectView();
  };

  const renderHomeView = () => {
    homeView.innerHTML = '';

    const shell = createElement('section', 'screen-card');
    const title = createElement('h1', 'view-title', 'Gael Games');
    const subtitle = createElement('p', 'view-subtitle', 'Elige un minijuego');
    const cards = createElement('div', 'home-cards');

    const puzzleButton = createElement('button', 'home-card home-card-puzzle');
    puzzleButton.type = 'button';
    puzzleButton.innerHTML = '<span class="home-card-title">Puzzle</span><span class="home-card-sub">Arma la imagen</span>';
    puzzleButton.addEventListener('click', () => {
      showView('puzzle-setup');
    });

    const memoryButton = createElement('button', 'home-card home-card-memory');
    memoryButton.type = 'button';
    memoryButton.innerHTML = '<span class="home-card-title">Memory</span><span class="home-card-sub">Encuentra pares</span>';
    memoryButton.addEventListener('click', () => {
      showView('memory-select');
    });

    cards.append(puzzleButton, memoryButton);
    shell.append(title, subtitle, cards);
    homeView.appendChild(shell);
  };

  const renderPuzzleSetupView = () => {
    puzzleSetupView.innerHTML = '';

    const shell = createElement('section', 'screen-card');
    const topNav = createElement('div', 'top-nav');
    const homeButton = createElement('button', 'ui-btn ui-btn-primary', 'Inicio');
    homeButton.type = 'button';
    homeButton.addEventListener('click', () => {
      showView('home');
    });
    topNav.appendChild(homeButton);

    const title = createElement('h2', 'view-title view-title-small', 'Puzzle');
    const subtitle = createElement('p', 'view-subtitle', 'Elige piezas y una imagen');

    const piecesSection = createElement('div', 'setup-section');
    const piecesLabel = createElement('h3', 'section-title', 'Numero de piezas');
    const optionsRow = createElement('div', 'piece-options');
    pieceOptions.forEach((option) => {
      const optionButton = createElement(
        'button',
        `ui-btn piece-option${state.selectedPieceOption === option ? ' is-selected' : ''}`,
        option.label
      );
      optionButton.type = 'button';
      optionButton.addEventListener('click', () => {
        state.selectedPieceOption = option;
        renderPuzzleSetupView();
      });
      optionsRow.appendChild(optionButton);
    });
    piecesSection.append(piecesLabel, optionsRow);

    const gallerySection = createElement('div', 'setup-section');
    const galleryLabel = createElement('h3', 'section-title', 'Imagen de juego');
    const galleryGrid = createElement('div', 'gallery-grid');

    puzzleGallery.forEach((item) => {
      const selectionId = `gallery-${item.id}`;
      const card = createElement('button', `gallery-card${state.selectedImage?.id === selectionId ? ' is-selected' : ''}`);
      card.type = 'button';

      const image = createElement('img', 'gallery-thumb');
      image.src = item.url;
      image.alt = item.name;

      const name = createElement('span', 'gallery-name', item.name);
      card.append(image, name);
      card.addEventListener('click', () => {
        state.selectedImage = galleryItemToSelection(item);
        state.puzzleMessage = '';
        renderPuzzleSetupView();
      });
      galleryGrid.appendChild(card);
    });
    gallerySection.append(galleryLabel, galleryGrid);

    const actionsRow = createElement('div', 'actions-row');

    const chooseFileButton = createElement('button', 'ui-btn ui-btn-secondary', 'Elegir archivo');
    chooseFileButton.type = 'button';
    chooseFileButton.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    const startPuzzleButton = createElement('button', 'ui-btn ui-btn-success', 'Comenzar puzzle');
    startPuzzleButton.type = 'button';
    startPuzzleButton.addEventListener('click', () => {
      if (!state.selectedImage?.url || !state.selectedPieceOption) {
        setPuzzleMessage('Primero elige una imagen y un numero de piezas.', 'error');
        return;
      }

      const started = startPuzzleGame(
        state.selectedImage.url,
        state.selectedImage.name,
        state.selectedPieceOption.cols,
        state.selectedPieceOption.rows
      );

      if (!started) {
        setPuzzleMessage('No se pudo iniciar el puzzle.', 'error');
        return;
      }

      state.puzzleMessage = '';
    });

    actionsRow.append(chooseFileButton, startPuzzleButton);

    const lastImage = getLastSavedImage();
    const selectedImageText = createElement(
      'p',
      'selected-text',
      `Imagen seleccionada: ${state.selectedImage?.name ?? 'sin seleccionar'}`
    );

    shell.append(topNav, title, subtitle, piecesSection, gallerySection, actionsRow);

    if (lastImage?.dataUrl) {
      const useLastButton = createElement('button', 'ui-btn ui-btn-tertiary', `Usar ultima (${lastImage.name})`);
      useLastButton.type = 'button';
      useLastButton.addEventListener('click', () => {
        state.selectedImage = {
          id: 'last-image',
          name: `Ultima imagen (${lastImage.name})`,
          url: lastImage.dataUrl
        };
        state.puzzleMessage = '';
        renderPuzzleSetupView();
      });
      shell.appendChild(useLastButton);
    }

    shell.appendChild(selectedImageText);

    if (state.puzzleMessage) {
      const status = createElement('p', `status-text status-${state.puzzleMessageTone}`, state.puzzleMessage);
      shell.appendChild(status);
    }

    puzzleSetupView.appendChild(shell);
  };

  const renderMemorySelectView = () => {
    memorySelectView.innerHTML = '';

    const shell = createElement('section', 'screen-card');
    const topNav = createElement('div', 'top-nav');
    const homeButton = createElement('button', 'ui-btn ui-btn-primary', 'Inicio');
    homeButton.type = 'button';
    homeButton.addEventListener('click', () => {
      showView('home');
    });
    topNav.appendChild(homeButton);

    const title = createElement('h2', 'view-title view-title-small', 'Memory');
    const subtitle = createElement('p', 'view-subtitle', 'Elige una tematica');
    const themesGrid = createElement('div', 'themes-grid');

    memoryThemes.forEach((theme) => {
      const card = createElement('button', `theme-card${state.memoryReady ? '' : ' is-disabled'}`);
      card.type = 'button';
      card.disabled = !state.memoryReady;

      const image = createElement('img', 'theme-thumb');
      image.src = theme.cards[0]?.imageUrl ?? '';
      image.alt = theme.name;

      const name = createElement('span', 'theme-name', theme.name);
      const meta = createElement('span', 'theme-meta', `${theme.cards.length} pares`);
      card.append(image, name, meta);

      card.addEventListener('click', () => {
        if (!state.memoryReady) {
          setMemoryMessage('Cargando assets de Memory. Intenta de nuevo en unos segundos.', 'info');
          return;
        }
        openMemoryPairSelector(theme);
      });

      themesGrid.appendChild(card);
    });

    shell.append(topNav, title, subtitle);

    if (!state.memoryReady) {
      shell.appendChild(createElement('p', 'status-text status-info', 'Cargando recursos de Memory...'));
    }

    shell.appendChild(themesGrid);

    if (state.memoryMessage) {
      shell.appendChild(createElement('p', `status-text status-${state.memoryMessageTone}`, state.memoryMessage));
    }

    memorySelectView.appendChild(shell);
  };

  const renderGameOverlay = (gameKey) => {
    gameOverlay.innerHTML = '';

    const overlayBar = createElement('div', 'overlay-bar');
    const label = createElement('span', 'overlay-pill', gameKey === 'puzzle' ? 'Puzzle en curso' : 'Memory en curso');
    const actions = createElement('div', 'overlay-actions');

    const buttons =
      gameKey === 'puzzle'
        ? [
            {
              label: '?',
              action: 'hint',
              variant: 'hint',
              active: state.puzzleHintEnabled
            },
            { label: 'Inicio', to: 'home' },
            { label: 'Configurar', to: 'setup' }
          ]
        : [
            { label: 'Inicio', to: 'home' },
            { label: 'Tematicas', to: 'themes' }
          ];

    buttons.forEach((entry) => {
      const button = createElement(
        'button',
        `overlay-btn${entry.variant ? ` overlay-btn-${entry.variant}` : ''}${entry.active ? ' is-active' : ''}`,
        entry.label
      );
      button.type = 'button';
      if (entry.action === 'hint') {
        button.setAttribute('aria-label', state.puzzleHintEnabled ? 'Ocultar imagen final' : 'Mostrar imagen final');
        button.title = state.puzzleHintEnabled ? 'Ocultar imagen final' : 'Mostrar imagen final';
      }
      button.addEventListener('click', () => {
        if (entry.action === 'hint') {
          togglePuzzleHint?.();
          return;
        }
        requestExitToMenu({ game: gameKey, to: entry.to });
      });
      actions.appendChild(button);
    });

    overlayBar.append(label, actions);
    gameOverlay.appendChild(overlayBar);
    gameOverlay.classList.remove('view-hidden');
    gameOverlay.classList.add('view-visible');
  };

  const hideGame = () => {
    closeMemoryPairSelector();
    gameContainer.classList.remove('view-visible');
    gameContainer.classList.add('view-hidden');
    gameOverlay.classList.remove('view-visible');
    gameOverlay.classList.add('view-hidden');
    gameOverlay.innerHTML = '';
    state.activeGame = null;
    state.puzzleHintEnabled = false;
  };

  const showGame = (gameKey) => {
    state.activeGame = gameKey;
    uiRoot.classList.add('ui-hidden');
    gameContainer.classList.remove('view-hidden');
    gameContainer.classList.add('view-visible');
    renderGameOverlay(gameKey);
  };

  const showView = (viewKey) => {
    if (!views[viewKey]) {
      return;
    }

    state.currentView = viewKey;
    hideGame();
    uiRoot.classList.remove('ui-hidden');

    Object.entries(views).forEach(([key, element]) => {
      element.classList.toggle('view-hidden', key !== viewKey);
      element.classList.toggle('view-visible', key === viewKey);
    });
  };

  const setMemoryReady = (ready) => {
    state.memoryReady = Boolean(ready);
    if (state.memoryReady && state.memoryMessage.startsWith('Cargando assets')) {
      state.memoryMessage = '';
    }
    renderMemorySelectView();
  };

  const setPuzzleHintEnabled = (enabled) => {
    state.puzzleHintEnabled = Boolean(enabled);
    if (state.activeGame === 'puzzle') {
      renderGameOverlay('puzzle');
    }
  };

  const handleGameExit = ({ game, to, reason }) => {
    hideGame();

    if (game === 'puzzle') {
      state.puzzleHintEnabled = false;
      if (to === 'home') {
        showView('home');
      } else {
        showView('puzzle-setup');
      }

      if (reason === 'victory' || to === 'victory') {
        setPuzzleMessage('Muy bien. Puzzle completado.', 'success');
      } else if (reason === 'error') {
        setPuzzleMessage('No se pudo iniciar el puzzle con la imagen seleccionada.', 'error');
      }
      return;
    }

    if (game === 'memory') {
      if (to === 'home') {
        showView('home');
      } else {
        showView('memory-select');
      }

      if (reason === 'victory' || to === 'victory') {
        setMemoryMessage('Excelente. Encontraste todos los pares.', 'success');
      } else if (reason === 'error') {
        setMemoryMessage('No se pudo iniciar la partida de Memory.', 'error');
      }
      return;
    }

    showView('home');
  };

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      if (!dataUrl) {
        setPuzzleMessage('No se pudo leer el archivo seleccionado.', 'error');
        return;
      }

      state.selectedImage = {
        id: 'file-custom',
        name: file.name,
        url: dataUrl
      };

      if (!saveLastImage(dataUrl, file.name)) {
        setPuzzleMessage('Imagen cargada, pero no se pudo guardar en localStorage.', 'error');
        return;
      }

      setPuzzleMessage(`Archivo cargado: ${file.name}`, 'success');
    };

    reader.onerror = () => {
      setPuzzleMessage('Error al leer el archivo.', 'error');
    };

    reader.readAsDataURL(file);
  });

  memoryPairsCancel.addEventListener('click', () => {
    closeMemoryPairSelector();
  });

  memoryPairsDialog.addEventListener('click', (event) => {
    if (event.target === memoryPairsDialog) {
      closeMemoryPairSelector();
    }
  });

  renderHomeView();
  renderPuzzleSetupView();
  renderMemorySelectView();
  showView('home');

  return {
    showView,
    showGame,
    hideGame,
    setMemoryReady,
    setPuzzleHintEnabled,
    handleGameExit
  };
}
