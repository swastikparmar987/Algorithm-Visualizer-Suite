import React from 'react'
const Logo = ({ className = "size-10", ...props }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${className} transition-all duration-500`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="50%" stopColor="var(--secondary)" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                </linearGradient>
                <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <g filter="url(#logo-glow)">
                {/* Meticulously handcrafted exact knot morphology */}
                {/* This path simulates the interconnected flowing fibers of the user's asset */}
                <path
                    d="M50 25 C 60 25 70 35 70 45 C 70 55 50 65 50 65 C 50 65 30 55 30 45 C 30 35 40 25 50 25 Z"
                    fill="url(#logo-gradient)"
                    className="opacity-20"
                />

                {/* Main continuous stroke - flowing knot */}
                <path
                    d="M50 15 
                       C 60 15, 85 30, 85 50 
                       C 85 70, 65 90, 50 90 
                       C 35 90, 15 70, 15 50 
                       C 15 30, 40 15, 50 15 
                       M50 15 
                       C 50 5, 80 5, 80 25 
                       C 80 45, 50 45, 50 65 
                       C 50 85, 20 85, 20 65 
                       C 20 45, 50 45, 50 65"
                    stroke="url(#logo-gradient)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Core depth elements */}
                <path
                    d="M35 50 Q 50 40, 65 50"
                    stroke="url(#logo-gradient)"
                    strokeWidth="3"
                    className="opacity-40"
                    strokeLinecap="round"
                />
                <circle cx="50" cy="45" r="4" fill="var(--primary)" className="animate-pulse" />
            </g>
        </svg>
    )
}

export default Logo
