# Project Context

## Purpose
- Browser game collection for kids built with Phaser.
- Main flows:
  - Enter Home scene.
  - Choose game mode (`Memory` or `Puzzle`).
  - Select theme/image and play.

## Architecture
- Tech stack: `Phaser 3`, `Vite 5`, plain JS modules.
- Entry points:
  - `src/main.js`
  - `src/ui/app.js`
- Key directories:
  - `src/scenes` (scene orchestration and game UI flow)
  - `src/games/memory` and `src/games/puzzle` (game-specific data/services)
  - `src/consts/memory.json` (memory themes/cards metadata)
  - `src/assets` (images and static game assets)

## Functional Map
- Memory mode:
  - Files: `src/scenes/MemoryScene.js`, `src/scenes/MemoryGameScene.js`, `src/games/memory/themes.js`, `src/consts/memory.json`
  - Dependencies: theme JSON + assets in `src/assets/memory/themes`
- Puzzle mode:
  - Files: `src/scenes/PuzzleScene.js`, `src/scenes/PuzzleGameScene.js`, `src/games/puzzle/gallery.js`
  - Dependencies: gallery assets in `src/assets/puzzle/gallery`
- Shared scene routing:
  - Files: `src/scenes/BootScene.js`, `src/scenes/HomeScene.js`
  - Dependencies: Phaser scene lifecycle and loader

## Run & Verify
- Install: `npm install`
- Dev run: `npm run dev`
- Test URL: `http://gael-games.com:5173`
- Build: `npm run build`
- Tests: no formal automated test suite configured yet.
- Asset optimization: `npm run images:optimize`

## Constraints
- Keep images compressed before finalizing edits (`npm run images:optimize`).
- Preserve current scene architecture and asset loading conventions.
- Avoid changing gameplay behavior unless task explicitly requests it.
- No secrets should be stored in repo files.

## Planner Asset Rules (Project-Specific)
- For image/design tasks, Planner must enforce "buen gusto":
  - child-friendly visuals,
  - clear focal subject,
  - no watermarks,
  - avoid schematic/diagram style unless explicitly requested.
- Planner should delegate non-coding asset/research work to `Executer` when applicable.
- Executer should use MCP browser for image discovery/validation and only fallback to AI generation (ChatGPT/Nano Banana) when web sources are insufficient.
