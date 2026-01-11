import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ImageComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function ImageComparisonSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Original',
    afterLabel = 'Analysis',
    className = '',
}: ImageComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isResizing || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const width = rect.width;
        const position = Math.max(0, Math.min(100, (x / width) * 100));

        setSliderPosition(position);
    };

    // Allow click to jump
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const position = Math.max(0, Math.min(100, (x / width) * 100));
        setSliderPosition(position);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl cursor-ew-resize select-none border border-gray-200 bg-gray-100 ${className}`}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onClick={handleClick}
        >
            {/* Background Image (After/Analysis) */}
            <img
                src={afterImage}
                alt="After"
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
            />
            {afterLabel && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-xs rounded pointer-events-none z-10">
                    {afterLabel}
                </div>
            )}

            {/* Foreground Image (Before/Original) - Clipped */}
            <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.3)] bg-white/5"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute top-0 left-0 w-full h-full object-contain max-w-none"
                    style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
                />
                {beforeLabel && (
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-xs rounded z-20">
                        {beforeLabel}
                    </div>
                )}
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600">
                    <ChevronsLeftRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
