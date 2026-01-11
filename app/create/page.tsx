'use client';

import { useState } from 'react';
import Link from 'next/link';
import wordCollection from '@/word-collection.json';
import { Position, Path, pathToWord } from '@/lib/pathValidator';

const GRID_SIZE = 4;

type WordCollection = Record<string, string>; // word -> lemma

export default function CreatePage() {
    const [grid, setGrid] = useState<string[][]>(() => {
        // Initialize empty grid
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    });
    const [possibleWords, setPossibleWords] = useState<Map<string, string[]>>(new Map());
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Function to find all words from grid using word-collection
    const findAllWordsFromGrid = (grid: string[][], wordList: string[]): string[] => {
        const foundWords = new Set<string>();
        const gridSize = grid.length;
        const minLength = 4;

        // Create a set of words for fast lookup (normalized to lowercase for matching)
        const wordSet = new Set(wordList.map(w => w.toLowerCase()));

        // Directions for adjacent cells (including diagonals)
        const directions: Position[] = [
            { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
            { row: 0, col: -1 }, { row: 0, col: 1 },
            { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
        ];

        // DFS function to explore all paths from a starting position
        function dfs(currentPath: Path, visited: Set<string>) {
            const currentWord = pathToWord(currentPath, grid);

            // If word is long enough, check if it exists in word-collection
            if (currentWord.length >= minLength) {
                const normalizedWord = currentWord.toLowerCase();
                // Check if this word (or any case variant) exists in word-collection
                if (wordSet.has(normalizedWord)) {
                    // Find all words from wordList that match (preserving case/diacritics)
                    // This includes words with different accents
                    const matchingWords = wordList.filter(w => w.toLowerCase() === normalizedWord);
                    matchingWords.forEach(word => foundWords.add(word));
                }
            }

            // Get current position
            const currentPos = currentPath[currentPath.length - 1];

            // Try all adjacent directions
            for (const dir of directions) {
                const nextRow = currentPos.row + dir.row;
                const nextCol = currentPos.col + dir.col;

                // Check bounds
                if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
                    continue;
                }

                const nextPos: Position = { row: nextRow, col: nextCol };
                const nextKey = `${nextRow},${nextCol}`;

                // Skip if already visited in this path
                if (visited.has(nextKey)) {
                    continue;
                }

                // Continue exploring
                const newPath = [...currentPath, nextPos];
                const newVisited = new Set(visited);
                newVisited.add(nextKey);

                dfs(newPath, newVisited);
            }
        }

        // Start DFS from every cell in the grid
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const startPos: Position = { row, col };
                const visited = new Set<string>();
                visited.add(`${row},${col}`);
                dfs([startPos], visited);
            }
        }

        return Array.from(foundWords).sort();
    };

    const handleCellChange = (row: number, col: number, value: string) => {
        // Only allow single letter (or empty)
        const letter = value.toLowerCase().slice(-1);
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = letter;
        setGrid(newGrid);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);

        // Check if grid is complete
        const isComplete = grid.every(row => row.every(cell => cell.length > 0));
        if (!isComplete) {
            alert('Please fill in all cells before analyzing.');
            setIsAnalyzing(false);
            return;
        }

        // Use word-collection.json directly to find all possible words
        const wordCollectionData = wordCollection as WordCollection;

        // Get all words from word-collection (these are the keys)
        const allWords = Object.keys(wordCollectionData);

        // Find all words that can be formed from the grid
        const foundWords = findAllWordsFromGrid(grid, allWords);
        setPossibleWords(new Map(foundWords.map(word => [word, [word]])));

        // Build result in the requested format
        const wordsArray: [string, string][] = [];

        // For each found word, get its lemma from word-collection
        // Keep words with different accents separate
        for (const word of foundWords) {
            // The word is already the exact key from word-collection.json
            // so we can directly look it up
            const lemma = wordCollectionData[word];
            if (lemma) {
                wordsArray.push([word, lemma]);
            }
        }

        // Sort words alphabetically by word
        wordsArray.sort((a, b) => a[0].localeCompare(b[0]));

        // Create the final result object
        const result = {
            grid: grid,
            words: wordsArray
        };

        // Console.log the results in the requested format
        console.log('Grid Analysis Results:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`\nTotal words found: ${wordsArray.length}`);

        setIsAnalyzing(false);
    };

    const handleClear = () => {
        setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
        setPossibleWords(new Map());
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-4xl">
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-bold text-indigo-900 mb-2">Cruthaigh Cearnóg</h1>
                    <p className="text-indigo-700">Cruthaigh do chluiche féin</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid gap-2 mb-4 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                        {grid.map((row, rowIdx) => (
                            row.map((letter, colIdx) => (
                                <input
                                    key={`${rowIdx}-${colIdx}`}
                                    type="text"
                                    maxLength={1}
                                    value={letter}
                                    onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                    className="aspect-square text-xl font-bold text-center rounded-lg border-2 border-indigo-300 focus:border-indigo-600 focus:outline-none bg-indigo-50 text-indigo-900 uppercase w-full"
                                    placeholder=""
                                />
                            ))
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? 'Ag anailísiú...' : 'Déan'}
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                        >
                            Glan
                        </button>
                        <Link
                            href="/"
                            className="flex-1 py-2 px-4 bg-indigo-200 text-indigo-900 rounded-lg hover:bg-indigo-300 transition-colors font-semibold text-center"
                        >
                            Ar Ais
                        </Link>
                    </div>
                </div>

                {possibleWords.size > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-indigo-900 mb-4">
                            Focail Féideartha: {Array.from(possibleWords.values()).reduce((sum, variants) => sum + variants.length, 0)}
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {Array.from(possibleWords.values())
                                    .flat()
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((word, index) => (
                                        <div
                                            key={`${word}-${index}`}
                                            className="px-3 py-2 bg-indigo-50 rounded text-indigo-900 font-medium text-sm"
                                        >
                                            {word}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
