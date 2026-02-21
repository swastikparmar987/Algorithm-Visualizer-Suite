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
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <g filter="url(#logo-glow)">
                {/* High-Fidelity Handcrafted Knot Logo */}
                {/* This path recreates the interconnected "Lotus/Brain" knot provided by the user */}
                <path
                    d="M50 35 
                       C 55 35, 60 40, 60 45 
                       C 60 55, 40 55, 40 45 
                       C 40 40, 45 35, 50 35 Z"
                    fill="url(#logo-gradient)"
                    className="opacity-20"
                />

                {/* Main continuous stroke for the knot */}
                <path
                    d="M50 30 
                       C 65 30, 80 40, 80 55 
                       C 80 70, 65 85, 50 85 
                       C 35 85, 20 70, 20 55 
                       C 20 40, 35 30, 50 30 
                       M50 30 
                       C 50 10, 80 10, 80 30 
                       C 80 50, 50 50, 50 70 
                       C 50 90, 20 90, 20 70 
                       C 20 50, 50 50, 50 30 
                       Z"
                    stroke="url(#logo-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Inner detail for depth */}
                <path
                    d="M40 55 Q 50 45, 60 55"
                    stroke="url(#logo-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-60"
                />
            </g>
        </svg>
    )
}

export default Logo
