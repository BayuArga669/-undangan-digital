'use client';

import { CSSProperties } from 'react';

interface GoldenLeafProps {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size?: number;
    opacity?: number;
    color?: string;
    style?: CSSProperties;
    variant?: 'gold' | 'rustic';
}

export default function GoldenLeaf({ position, size = 200, opacity = 0.5, color = '#B8860B', style, variant = 'gold' }: GoldenLeafProps) {
    const positionStyles: Record<string, CSSProperties> = {
        'top-left': { top: 0, left: 0, transform: 'rotate(0deg)' },
        'top-right': { top: 0, right: 0, transform: 'scaleX(-1)' },
        'bottom-left': { bottom: 0, left: 0, transform: 'scaleY(-1)' },
        'bottom-right': { bottom: 0, right: 0, transform: 'scale(-1, -1)' },
    };

    const isRustic = variant === 'rustic';
    const rusticColor1 = '#C19A6B'; // Dried leaf
    const rusticColor2 = '#D4B996'; // Pampas
    const rusticColor3 = '#A67B5B'; // Branch

    return (
        <div
            style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                opacity: isRustic ? 0.9 : opacity,
                pointerEvents: 'none',
                zIndex: 1,
                ...positionStyles[position],
                ...style,
            }}
        >
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{
                filter: isRustic ? 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))' : 'none',
                overflow: 'visible',
                maskImage: isRustic ? 'radial-gradient(circle at 50% 100%, black 60%, transparent 100%)' : 'none',
                WebkitMaskImage: isRustic ? 'radial-gradient(circle at 50% 100%, black 60%, transparent 100%)' : 'none'
            }}>
                {isRustic ? (
                    // Rustic / Dried Flower Theme
                    <>
                        {/* Background Grass - Delayed Sway */}
                        <g className="animate-wind-sway-delayed" style={{ transformOrigin: '50% 100%' }}>
                            <path d="M-10 210 Q20 100 60 20" stroke={rusticColor2} strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
                            <path d="M20 200 Q40 120 30 10" stroke={rusticColor2} strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round" />
                            <path d="M50 190 Q60 130 90 40" stroke={rusticColor2} strokeWidth="5" fill="none" opacity="0.3" strokeLinecap="round" />
                            {/* Pampas fluff */}
                            <path d="M55 25 Q60 5 65 25" stroke={rusticColor2} strokeWidth="6" opacity="0.2" style={{ filter: 'blur(2px)' }} strokeLinecap="round" />
                        </g>

                        {/* Middle Grass - Main Sway */}
                        <g className="animate-wind-sway" style={{ transformOrigin: '20% 100%' }}>
                            {/* Pampas Grass Plume 1 */}
                            <path d="M20 180 Q60 100 150 20" stroke={rusticColor2} strokeWidth="12" strokeLinecap="round" opacity="0.5" style={{ filter: 'blur(1.5px)' }} />
                            <path d="M30 190 Q70 110 160 30" stroke={rusticColor2} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                            {/* Extra stems */}
                            <path d="M0 200 Q30 140 10 60" stroke={rusticColor3} strokeWidth="2" fill="none" opacity="0.6" />
                        </g>

                        {/* Foreground Elements - Leaf Sway (slower) */}
                        <g className="animate-leaf-sway">
                            {/* Dried Palm Leaf Main - Smoothened curve */}
                            <path d="M10 220 Q80 120 180 50 L160 20 Q60 80 10 180 Z" fill={rusticColor1} opacity="0.85" />
                            <path d="M10 220 Q80 120 180 50" stroke={rusticColor3} strokeWidth="1" fill="none" />
                            {/* Ribs */}
                            <path d="M20 180 L40 160" stroke={rusticColor3} strokeWidth="0.5" />
                            <path d="M50 150 L70 130" stroke={rusticColor3} strokeWidth="0.5" />
                            <path d="M80 120 L100 100" stroke={rusticColor3} strokeWidth="0.5" />

                            {/* White Roses */}
                            <circle cx="50" cy="50" r="28" fill="#F9F3EA" opacity="0.95" />
                            <circle cx="50" cy="50" r="18" fill="#E6D0B3" opacity="0.4" />
                            <circle cx="54" cy="48" r="8" fill="#C19A6B" opacity="0.3" />

                            {/* Extra twigs */}
                            <path d="M100 150 Q130 130 180 140" stroke={rusticColor3} strokeWidth="2" fill="none" />
                            <circle cx="180" cy="140" r="3" fill={rusticColor3} />
                            <circle cx="160" cy="135" r="2" fill={rusticColor3} />
                        </g>

                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#F5E6D3', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#C19A6B', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                    </>
                ) : (
                    // Classic Gold Leaf
                    <>
                        <path
                            d="M10 190 Q30 140 60 100 Q80 70 100 50 Q120 30 150 15 Q130 50 115 80 Q100 110 90 140 Q80 160 75 190"
                            stroke={color}
                            strokeWidth="1.5"
                            fill={`${color}20`}
                            className="animate-leaf-sway"
                        />
                        <path d="M40 155 Q60 120 85 90 Q105 65 135 35" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
                        <path d="M55 130 Q70 105 90 85" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
                        <path d="M65 150 Q75 130 100 100" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />

                        <path
                            d="M5 180 Q20 150 35 130 Q55 100 80 80 Q60 110 50 135 Q40 155 35 180"
                            stroke={color}
                            strokeWidth="1.2"
                            fill={`${color}15`}
                        />

                        <path d="M100 50 Q110 35 125 20" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
                        <circle cx="128" cy="17" r="4" fill={`${color}30`} stroke={color} strokeWidth="0.8" />

                        <circle cx="140" cy="25" r="2" fill={color} opacity="0.3" />
                        <circle cx="155" cy="10" r="1.5" fill={color} opacity="0.2" />
                        <circle cx="45" cy="170" r="2" fill={color} opacity="0.25" />

                        <path
                            d="M15 195 Q25 175 40 160 Q55 145 75 135 Q55 155 45 170 Q35 183 30 195"
                            stroke={color}
                            strokeWidth="1"
                            fill={`${color}10`}
                        />
                    </>
                )}
            </svg>
        </div>
    );
}

export function FloatingParticles({ count = 15, color = '#DAA520' }: { count?: number; color?: string }) {
    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="floating-particle"
                    style={{
                        position: 'absolute',
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        background: color,
                        borderRadius: '50%',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.4 + 0.1,
                        animationDuration: `${Math.random() * 8 + 6}s`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}
