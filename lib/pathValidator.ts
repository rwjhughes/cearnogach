export type Position = { row: number; col: number };
export type Path = Position[];

export function isValidPath(path: Path, gridSize: number): boolean {
    if (path.length < 2) return false;

    // Check all positions are within grid
    for (const pos of path) {
        if (pos.row < 0 || pos.row >= gridSize ||
            pos.col < 0 || pos.col >= gridSize) {
            return false;
        }
    }

    // Check no duplicate positions
    const seen = new Set<string>();
    for (const pos of path) {
        const key = `${pos.row},${pos.col}`;
        if (seen.has(key)) return false;
        seen.add(key);
    }

    // Check all cells are adjacent (including diagonals)
    for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];

        const rowDiff = Math.abs(curr.row - prev.row);
        const colDiff = Math.abs(curr.col - prev.col);

        // Must be adjacent (including diagonals)
        if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
            return false;
        }
    }

    return true;
}

export function pathToWord(path: Path, grid: string[][]): string {
    return path.map(pos => grid[pos.row][pos.col]).join('');
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos2.row - pos1.row);
    const colDiff = Math.abs(pos2.col - pos1.col);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}
