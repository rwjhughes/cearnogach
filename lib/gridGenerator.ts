type Grid = string[][];

export type GridData = {
    grid: Grid;
    words: [string, string][]; // Array of [word, lemma] pairs
};

/**
 * Generates a grid from today's grid file (yyyymmdd.json) in the grids folder.
 * Falls back to random generation if the file is not found.
 * 
 * @param size - Grid size (ignored if using today's grid file)
 * @returns The grid from today's file, or a randomly generated grid as fallback
 */
export async function generateGrid(size: number): Promise<Grid | null> {
    try {
        // Fetch today's grid from API
        const response = await fetch('/api/grid');
        if (response.ok) {
            const gridData: GridData = await response.json();
            return gridData.grid;
        }
    } catch (error) {
        console.warn('Failed to load today\'s grid, falling back to random generation:', error);
    }
    return null;
}

/**
 * Gets the possible words for today's grid.
 * 
 * @returns A record mapping words to their lemmas, or null if not available
 */
export async function getTodayWords(): Promise<Record<string, string> | null> {
    try {
        const response = await fetch('/api/grid');
        if (response.ok) {
            const gridData: GridData = await response.json();
            // Convert words array [[word, lemma], ...] to Record<string, string>
            const words: Record<string, string> = {};
            if (gridData.words && Array.isArray(gridData.words)) {
                for (const [word, lemma] of gridData.words) {
                    words[word] = lemma;
                }
            }
            return words;
        }
    } catch (error) {
        console.warn('Failed to load today\'s words:', error);
    }
    return null;
}
