'use client';

import { useState, useEffect } from 'react';
import { generateGrid, getTodayWords } from '@/lib/gridGenerator';
import { isValidPath, pathToWord, isAdjacent, Position, Path } from '@/lib/pathValidator';
import TeanglannModal from './TeanglannModal';

const GRID_SIZE = 4;

export default function GameBoard() {
    const [grid, setGrid] = useState<string[][]>([]);
    const [selectedPath, setSelectedPath] = useState<Path>([]);
    const [foundWords, setFoundWords] = useState<Map<string, string>>(new Map()); // word -> lemma
    const [todayWords, setTodayWords] = useState<Record<string, string> | null>(null); // word -> lemma from grid file
    const [currentWord, setCurrentWord] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [selectedLemma, setSelectedLemma] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showResultSpan, setShowResultSpan] = useState(false);
    const [resultWord, setResultWord] = useState<string | null>(null);
    const [resultLemma, setResultLemma] = useState<string | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Initialize grid and load today's words on mount
    useEffect(() => {
        generateGrid(GRID_SIZE).then(newGrid => {
            if (newGrid) {
                setGrid(newGrid);
            }
        });
        getTodayWords().then(words => {
            if (words) {
                setTodayWords(words);
            }
        });
    }, []);

    // Update current word as path changes and validate against today's words
    useEffect(() => {
        if (selectedPath.length > 0 && grid.length > 0) {
            const word = pathToWord(selectedPath, grid);
            setCurrentWord(word);
            // Validate against today's words from grid file
            if (todayWords) {
                // Check if word exists in today's words (case-insensitive)
                const normalizedWord = word.toLowerCase();
                const wordExists = Object.keys(todayWords).some(
                    key => key.toLowerCase() === normalizedWord
                );
                setIsValid(wordExists);
            } else {
                setIsValid(null);
            }
        } else {
            setCurrentWord('');
            setIsValid(null);
        }
    }, [selectedPath, grid, todayWords]);

    const handleCellStart = (row: number, col: number) => {
        const pos: Position = { row, col };
        setIsDragging(true);
        setSelectedPath([pos]);
    };

    const handleCellEnter = (row: number, col: number) => {
        if (!isDragging) return;

        const pos: Position = { row, col };

        // Check if this cell is already in the path
        const cellIndex = selectedPath.findIndex(p => p.row === row && p.col === col);

        if (cellIndex !== -1) {
            // If returning to a previous tile, undo back to that position
            setSelectedPath(selectedPath.slice(0, cellIndex + 1));
            return;
        }

        // If there's an existing path, check if new position is adjacent to last
        if (selectedPath.length > 0) {
            const last = selectedPath[selectedPath.length - 1];

            if (isAdjacent(last, pos)) {
                // Add the new cell to the path
                setSelectedPath([...selectedPath, pos]);
            }
        }
    };

    const handleCellMouseDown = (row: number, col: number) => {
        handleCellStart(row, col);
    };

    const handleCellMouseEnter = (row: number, col: number) => {
        handleCellEnter(row, col);
    };

    const handleCellTouchStart = (row: number, col: number, event: React.TouchEvent) => {
        event.preventDefault(); // Prevent scrolling
        handleCellStart(row, col);
    };

    const handleCellTouchMove = (row: number, col: number, event: React.TouchEvent) => {
        event.preventDefault(); // Prevent scrolling
        handleCellEnter(row, col);
    };

    const handleCellMouseUp = async () => {
        if (!isDragging) return;

        setIsDragging(false);

        // Submit the word if path is valid
        if (isValidPath(selectedPath, GRID_SIZE)) {
            const word = pathToWord(selectedPath, grid);
            // Validate against today's words from grid file
            if (todayWords) {
                const normalizedWord = word.toLowerCase();
                // Find the exact word key (preserving case/diacritics)
                const wordKey = Object.keys(todayWords).find(
                    key => key.toLowerCase() === normalizedWord
                );
                if (wordKey) {
                    const lemma = todayWords[wordKey];
                    // Store word -> lemma mapping
                    if (!foundWords.has(wordKey)) {
                        setFoundWords(new Map([...foundWords, [wordKey, lemma]]));
                    }
                    // Show result span for 5 seconds, then fade out
                    setResultWord(wordKey);
                    setResultLemma(lemma);
                    setShowResultSpan(true);
                    setIsFadingOut(false);
                    setTimeout(() => {
                        setIsFadingOut(true);
                        // Hide after fade-out animation completes (0.5s)
                        setTimeout(() => {
                            setShowResultSpan(false);
                            setResultWord(null);
                            setResultLemma(null);
                            setIsFadingOut(false);
                        }, 500);
                    }, 5000);
                } else {
                    // Invalid word - show result span for 5 seconds, then fade out
                    setResultWord(word);
                    setResultLemma(null);
                    setShowResultSpan(true);
                    setIsFadingOut(false);
                    setTimeout(() => {
                        setIsFadingOut(true);
                        // Hide after fade-out animation completes (0.5s)
                        setTimeout(() => {
                            setShowResultSpan(false);
                            setResultWord(null);
                            setResultLemma(null);
                            setIsFadingOut(false);
                        }, 500);
                    }, 5000);
                }
            }
        }

        setSelectedPath([]);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setSelectedPath([]);
        }
    };

    const handleTouchEnd = async () => {
        if (!isDragging) return;

        setIsDragging(false);

        // Submit the word if path is valid
        if (isValidPath(selectedPath, GRID_SIZE)) {
            const word = pathToWord(selectedPath, grid);
            // Validate against today's words from grid file
            if (todayWords) {
                const normalizedWord = word.toLowerCase();
                // Find the exact word key (preserving case/diacritics)
                const wordKey = Object.keys(todayWords).find(
                    key => key.toLowerCase() === normalizedWord
                );
                if (wordKey) {
                    const lemma = todayWords[wordKey];
                    // Store word -> lemma mapping
                    if (!foundWords.has(wordKey)) {
                        setFoundWords(new Map([...foundWords, [wordKey, lemma]]));
                    }
                    // Show result span for 5 seconds, then fade out
                    setResultWord(wordKey);
                    setResultLemma(lemma);
                    setShowResultSpan(true);
                    setIsFadingOut(false);
                    setTimeout(() => {
                        setIsFadingOut(true);
                        // Hide after fade-out animation completes (0.5s)
                        setTimeout(() => {
                            setShowResultSpan(false);
                            setResultWord(null);
                            setResultLemma(null);
                            setIsFadingOut(false);
                        }, 500);
                    }, 5000);
                } else {
                    // Invalid word - show result span for 5 seconds, then fade out
                    setResultWord(word);
                    setResultLemma(null);
                    setShowResultSpan(true);
                    setIsFadingOut(false);
                    setTimeout(() => {
                        setIsFadingOut(true);
                        // Hide after fade-out animation completes (0.5s)
                        setTimeout(() => {
                            setShowResultSpan(false);
                            setResultWord(null);
                            setResultLemma(null);
                            setIsFadingOut(false);
                        }, 500);
                    }, 5000);
                }
            }
        }

        setSelectedPath([]);
    };

    const isCellInPath = (row: number, col: number): boolean => {
        return selectedPath.some(p => p.row === row && p.col === col);
    };

    const isCellLastInPath = (row: number, col: number): boolean => {
        if (selectedPath.length === 0) return false;
        const last = selectedPath[selectedPath.length - 1];
        return last.row === row && last.col === col;
    };

    const handleWordClick = (word: string, lemma: string, event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        // Position modal below the clicked word, aligned to the left
        setModalPosition({
            x: rect.left,
            y: rect.bottom + 8, // 8px gap below the word
        });
        setSelectedLemma(lemma);
        setIsModalOpen(true);
    };

    if (!grid.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto pb-5">
            <div className="mb-6 mt-6 text-center">
                <h1 className="text-5xl font-bold text-indigo-900 mb-2">Cearnógach</h1>
            </div>

            <div className="flex flex-wrap-reverse mobile:flex-nowrap gap-6 max-w-4xl mx-auto px-4 ">
                {/* Words Found - Left Side */}
                <div className="flex-1 bg-white rounded-lg shadow-lg p-4  min-w-[250px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3">
                        Focail Aimsithe {foundWords.size} / {Object.keys(todayWords || {}).length}
                    </h3>
                    {(() => {
                        if (!todayWords) {
                            return <p className="text-indigo-600 text-center py-4">Níl aon fhocal aimsithe fós</p>;
                        }

                        // Group all words by length (from todayWords)
                        const allWordsByLength = new Map<number, string[]>();
                        Object.keys(todayWords).forEach(word => {
                            const length = word.length;
                            if (!allWordsByLength.has(length)) {
                                allWordsByLength.set(length, []);
                            }
                            allWordsByLength.get(length)!.push(word);
                        });

                        // Group found words by length
                        const foundWordsByLength = new Map<number, Array<[string, string]>>();
                        Array.from(foundWords.entries())
                            .sort(([a], [b]) => a.localeCompare(b))
                            .forEach(([word, lemma]) => {
                                const length = word.length;
                                if (!foundWordsByLength.has(length)) {
                                    foundWordsByLength.set(length, []);
                                }
                                foundWordsByLength.get(length)!.push([word, lemma]);
                            });

                        // Get sorted lengths (all possible lengths)
                        const sortedLengths = Array.from(allWordsByLength.keys()).sort((a, b) => a - b);

                        return (
                            <div className="space-y-2">
                                {sortedLengths.map((length) => {
                                    const totalWords = allWordsByLength.get(length)!.length;
                                    const foundWordsForLength = foundWordsByLength.get(length) || [];
                                    const foundCount = foundWordsForLength.length;
                                    const remainingCount = totalWords - foundCount;

                                    return (
                                        <div key={length} className="border-t border-indigo-200 pb-2 pt-2">
                                            <div className="sticky top-0 bg-white py-1 z-10">
                                                <h4 className="text-base font-bold text-indigo-900">
                                                    {length} letters
                                                </h4>

                                            </div>
                                            {foundWordsForLength.length > 0 && (
                                                <div className="flex flex-wrap gap-3 pb-1.5">
                                                    {foundWordsForLength.map(([word, lemma]) => (
                                                        <button
                                                            key={word}
                                                            onClick={(e) => handleWordClick(word, lemma, e)}
                                                            className="text-indigo-950 font-medium text-sm text-left hover:underline cursor-pointer"
                                                            title={lemma !== word ? `Lemma: ${lemma} - Click to search on teanglann.ie` : 'Click to search on teanglann.ie'}
                                                        >
                                                            {word}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {remainingCount > 0 && (
                                                <p className="text-xs text-gray-600 mt-0">
                                                    +{remainingCount} {remainingCount === 1 ? 'word' : 'words'} left
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {/* Grid - Right Side */}
                <div className="flex-shrink-0 bg-white rounded-lg shadow-lg p-4 h-[450px] flex flex-col-reverse justify-between">
                    <div
                        className="grid gap-2 mb-4"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: '350px' }}
                        onMouseUp={handleCellMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchEnd={handleTouchEnd}
                    >
                        {grid.map((row, rowIdx) => (
                            row.map((letter, colIdx) => {
                                const inPath = isCellInPath(rowIdx, colIdx);
                                const isLast = isCellLastInPath(rowIdx, colIdx);

                                return (
                                    <button
                                        key={`${rowIdx}-${colIdx}`}
                                        data-row={rowIdx}
                                        data-col={colIdx}
                                        className={`
                                            aspect-square text-4xl font-bold rounded-lg transition-all select-none touch-none
                      ${inPath
                                                ? isLast
                                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                                    : 'bg-indigo-400 text-white opacity-75'
                                                : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
                                            }
                                        `}
                                        onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                                        onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                                        onTouchStart={(e) => handleCellTouchStart(rowIdx, colIdx, e)}
                                        onTouchMove={(e) => {
                                            // Find which cell the touch is over
                                            const touch = e.touches[0];
                                            const target = document.elementFromPoint(touch.clientX, touch.clientY);
                                            if (target) {
                                                const button = target.closest('button[data-row][data-col]');
                                                if (button) {
                                                    const row = parseInt(button.getAttribute('data-row') || '0');
                                                    const col = parseInt(button.getAttribute('data-col') || '0');
                                                    handleCellTouchMove(row, col, e);
                                                }
                                            }
                                        }}
                                    >
                                        {letter.toUpperCase()}
                                    </button>
                                );
                            })
                        ))}
                    </div>

                    <div className="text-center">
                        <div className="text-base font-semibold text-indigo-900">
                            {currentWord && isDragging && (
                                <span className="text-4xl font-bold text-black">
                                    {currentWord.toUpperCase()}
                                </span>
                            )}
                        </div>
                        {showResultSpan && resultWord && !isDragging && (
                            <div className={`transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
                                <button
                                    onClick={(e) => {
                                        if (resultLemma) {
                                            const button = e.currentTarget;
                                            const rect = button.getBoundingClientRect();
                                            setModalPosition({
                                                x: rect.left,
                                                y: rect.bottom + 8,
                                            });
                                            setSelectedLemma(resultLemma);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    className={`text-4xl font-bold ${resultLemma
                                        ? 'text-green-600 hover:underline cursor-pointer'
                                        : 'text-red-600 cursor-default'
                                        }`}
                                >
                                    {resultWord.toUpperCase()}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Teanglann.ie Modal */}
            <TeanglannModal
                lemma={selectedLemma || ''}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalPosition(null);
                }}
                position={modalPosition}
            />
        </div >
    );
}
