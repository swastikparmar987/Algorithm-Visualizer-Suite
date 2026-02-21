import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass-panel m-4 mt-6 border-b-0"
            style={{ borderRadius: '24px' }}
        >
            <div className="flex items-center gap-2 cursor-pointer">
                <Logo className="size-10" />
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    ALGO_V1S
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                {['Features', 'Practice', 'Intelligence', 'Downloads'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        {item}
                    </a>
                ))}
            </div>

            <a href="https://github.com/swastikparmar987/Algorithm-Visualizer-Suite" target="_blank" className="btn-secondary text-sm px-5 py-2">
                GitHub
            </a>
        </motion.nav>
    );
};

export default Navbar;
