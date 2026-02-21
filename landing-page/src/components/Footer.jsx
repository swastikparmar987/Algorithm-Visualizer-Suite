import React from 'react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="py-12 px-6 border-t border-white/10 bg-[#050505]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 grayscale brightness-200">
                    <Logo className="size-8" />
                    <span className="text-lg font-bold tracking-tight text-white/50">ALGO_V1S</span>
                </div>

                <div className="text-gray-500 text-sm">
                    © 2026 Algorithm Visualizer Suite. All rights reserved.
                </div>

                <div className="flex gap-6">
                    {['Privacy', 'Terms', 'GitHub', 'Contact'].map((link) => (
                        <a key={link} href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                            {link}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
