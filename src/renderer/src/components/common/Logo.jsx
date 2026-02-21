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
                {/* Handcrafted abstract knot path inspired by the user's asset */}
                <path
                    d="M50 20 C 65 20 75 35 75 50 C 75 65 65 80 50 80 C 35 80 25 65 25 50 C 25 35 35 20 50 20 Z"
                    stroke="url(#logo-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-20"
                />
                <path
                    d="M50 10 C 70 10 90 30 90 50 C 90 70 70 90 50 90 C 30 90 10 70 10 50 C 10 30 30 10 50 10 M50 30 C 60 30 70 40 70 50 C 70 60 60 70 50 70 C 40 70 30 60 30 50 C 30 40 40 30 50 30 M50 10 L 50 30 M50 70 L 50 90 M10 50 L 30 50 M70 50 L 90 50"
                    stroke="url(#logo-gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="50" cy="50" r="5" fill="var(--primary)" className="animate-pulse" />
            </g>
        </svg>
    )
}

export default Logo
