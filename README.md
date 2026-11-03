# Sudoku

[![CI](https://github.com/helenyildirim/sudoku/actions/workflows/ci.yml/badge.svg)](https://github.com/helenyildirim/sudoku/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Sudoku game for Android built with Expo and React Native. The interface is in Turkish.

**[Download the Android APK](https://github.com/helenyildirim/sudoku/releases/latest)**

<p>
  <img src="docs/home.png" width="260" alt="Home screen" />
  <img src="docs/game.png" width="260" alt="Game screen" />
</p>

## Features

- Four difficulty levels, rated by the solving techniques a puzzle needs
- Hints that explain the reasoning and highlight the related row, column or box
- Sudoku School: five interactive lessons for beginners
- Daily challenge with streaks, statistics and 12 achievements
- Pencil marks, auto notes, undo, light and dark themes, haptic feedback
- Works offline, with regular and daily games saved separately on the device
- Screen reader labels for the board and controls

## How it works

Game logic lives in `src/game/` and has no UI dependencies, so it can be tested directly.

- `sudoku.ts` generates puzzles, solves them and finds hints.
- `session.ts` holds the moves: placing a value, notes, erasing and undo-safe updates.
- `progress.ts` turns a finished game into statistics, streaks and achievements.

- The board is a flat array of 81 numbers, with `0` for an empty cell.
- A puzzle starts as a full board filled by randomized backtracking. Cells are then removed one at a time, and a removal is kept only if the puzzle still has exactly one solution.
- Each puzzle is scored by simulating the hints a player would need. The generator retries until the score fits the level.
- The daily puzzle uses a seeded random number generator, so a given date always produces the same puzzle.

## Run it

```
npm install
npx expo start
```

## Checks

```
npm run typecheck
npm run lint
npm test
```

The tests cover puzzle generation, seeded output, the solver, the hint engine, game moves, statistics and streaks. One test pins a known daily puzzle, so a generator change cannot silently give players different puzzles.

## Build

GitHub Actions builds a release APK on every push to `main` and publishes it under Releases.

## Stack

Expo SDK 57, React Native, TypeScript, AsyncStorage

## License

MIT
