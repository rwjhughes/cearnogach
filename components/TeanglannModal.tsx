'use client';

import { useEffect, useState } from 'react';

interface TeanglannModalProps {
    lemma: string;
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number } | null;
}

export default function TeanglannModal({ lemma, isOpen, onClose, position }: TeanglannModalProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 770);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isOpen || !lemma) return null;

    return (
        <>
            {/* Backdrop - visible on mobile */}
            <div
                className={`fixed inset-0 z-40 ${isMobile ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0'}`}
                onClick={onClose}
            />
            {/* Modal - centered on mobile, positioned on desktop */}
            <div
                className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-3 pt-0 max-h-[370px] overflow-y-auto"
                style={isMobile ? {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    maxWidth: '400px',
                } : position ? {
                    width: '300px',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-row-reverse items-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <iframe
                    src={`https://www.teanglann.ie/en/fgb/${encodeURIComponent(lemma)}`}
                    className="w-full h-[600px] border border-gray-300 rounded"
                    title={`Teanglann.ie search for ${lemma}`}
                />
            </div>
        </>
    );
}
