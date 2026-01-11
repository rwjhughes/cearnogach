import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
    try {
        // Get today's date in yyyymmdd format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        // Construct path to grid file
        const gridPath = join(process.cwd(), 'grids', `${dateStr}.json`);

        // Read and parse the grid file
        const gridData = JSON.parse(readFileSync(gridPath, 'utf8'));

        return NextResponse.json(gridData);
    } catch (error) {
        // If today's file doesn't exist, try to get the most recent one
        try {
            const gridsDir = join(process.cwd(), 'grids');
            const files = readdirSync(gridsDir)
                .filter((f: string) => f.endsWith('.json'))
                .sort()
                .reverse();

            if (files.length > 0) {
                const mostRecentFile = files[0];
                const gridPath = join(gridsDir, mostRecentFile);
                const gridData = JSON.parse(readFileSync(gridPath, 'utf8'));
                return NextResponse.json(gridData);
            }

            return NextResponse.json(
                { error: 'No grid file found' },
                { status: 404 }
            );
        } catch (fallbackError) {
            return NextResponse.json(
                { error: 'Failed to load grid file' },
                { status: 500 }
            );
        }
    }
}
