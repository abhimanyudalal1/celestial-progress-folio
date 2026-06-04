import { useState, useEffect } from 'react';

interface WindowSize {
    width: number;
    height: number;
}

export function useWindowSize(delay: number = 250): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, delay);
        };

        window.addEventListener('resize', handleResize);

        // Set dimensions immediately on mount (no debounce) to avoid layout shift.
        // The debounced handler is only for subsequent resize events.
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [delay]);

    return windowSize;
}
