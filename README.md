# Cearnógach - Cluiche Focail Gaeilge

An Irish language word search game built with Next.js, inspired by Squardle.

## Features

- Interactive 4x4 letter grid
- Connect adjacent letters (including diagonals) to form words
- Real-time word validation against Irish word list
- Track found words
- Beautiful, responsive UI with Irish language interface

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## How to Play

1. Click on letters in the grid to start forming a word
2. Continue clicking adjacent letters (including diagonals)
3. Click the last letter again to submit the word
4. Valid words are added to your found words list
5. Click "Cluiche Nua" to start a new game

## Project Structure

- `app/` - Next.js app directory with pages and layout
- `components/` - React components (GameBoard)
- `lib/` - Utility functions (word dictionary, grid generator, path validator)
- `word-list.json` - Filtered Irish word list (241,005 words)

## Word List

The game uses a filtered word list from `word-list.json` containing:
- Only words 4+ letters long
- No special characters (apostrophes, dashes)
- No séimhiú or urú forms
- All valid Irish words and their inflected forms
