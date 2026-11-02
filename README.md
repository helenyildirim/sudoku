# Sudoku

[![CI](https://github.com/helenyildirim/sudoku/actions/workflows/ci.yml/badge.svg)](https://github.com/helenyildirim/sudoku/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Sudoku game for Android built with Expo and React Native. The interface is in Turkish.

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

All game logic is in `sudoku.js`, separate from the UI.

- The board is a flat array of 81 numbers, with `0` for an empty cell.
- A puzzle starts as a full board filled by randomized backtracking. Cells are then removed one at a time, and a removal is kept only if the puzzle still has exactly one solution.
- Each puzzle is scored by simulating the hints a player would need. The generator retries until the score fits the level.
- The daily puzzle uses a seeded random number generator, so a given date always produces the same puzzle.

## Run it

```
npm install
npx expo start
```

## Tests

```
npm test
```

The tests cover puzzle generation, seeded output, the solver and the hint engine.

## Build

GitHub Actions builds a release APK on every push to `main` and publishes it under Releases.

## Stack

Expo SDK 57, React Native, AsyncStorage

## License

MIT
