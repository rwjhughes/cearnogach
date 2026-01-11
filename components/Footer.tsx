'use client';

export default function Footer() {
    return (
        <footer className="text-center py-4 text-sm text-indigo-700 bg-indigo-100 max-w-[300px] mx-auto mb-4">
            Arna fhorbairt ag{' '}
            <a
                href="https://risteard.ie"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-900 hover:underline font-medium"
            >
                Risteárd Ó hAodha
            </a>
        </footer>
    );
}
