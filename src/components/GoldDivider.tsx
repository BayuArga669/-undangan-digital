'use strict';

import React from 'react';

interface GoldDividerProps {
    className?: string;
    style?: React.CSSProperties;
    flip?: boolean;
}

export default function GoldDivider({ className = '', style, flip = false }: GoldDividerProps) {
    return (
        <div
            className={`w-full relative ${className}`}
            style={{
                height: '40px',
                overflow: 'hidden',
                transform: flip ? 'scaleX(-1)' : 'none',
                ...style
            }}
        >
            <svg
                viewBox="0 0 1200 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%' }}
            >
                <path
                    d="M0 60 C 200 40, 400 90, 600 60 C 800 30, 1000 60, 1200 40 L 1200 90 C 1000 110, 800 70, 600 90 C 400 110, 200 60, 0 80 Z"
                    fill="#8B6914"
                    fillOpacity="0.8"
                />
                <path
                    d="M0 65 C 200 45, 400 95, 600 65 C 800 35, 1000 65, 1200 45 L 1200 85 C 1000 105, 800 65, 600 85 C 400 105, 200 65, 0 75 Z"
                    fill="#DAA520"
                    fillOpacity="0.6"
                />
            </svg>
        </div>
    );
}
