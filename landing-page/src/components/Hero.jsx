import React from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Laptop } from 'lucide-react';
import Logo from './Logo';

const Hero = () => {
    const latestRelease = "https://github.com/swastikparmar987/Algorithm-Visualizer-Suite/releases/latest";

    return (
        <section className="pt-40 pb-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="mb-8"
                >
                    <Logo className="size-40 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
                >
                    Design the <span className="neon-text">Machine</span><br />
                    Experience the <span className="neon-text">Logic.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
                >
                    A high-fidelity algorithm visualization suite for the next generation of engineers.
                    Hardened security, AI-powered insights, and buttery smooth 60fps logic.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 items-center"
                >
                    <a href={latestRelease} target="_blank" className="btn-primary group">
                        <Monitor className="size-5" />
                        Download for Windows
                    </a>
                    <a href={latestRelease} target="_blank" className="btn-secondary group">
                        <Laptop className="size-5" />
                        Download for macOS
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-20 w-full max-w-5xl glass-panel p-2 animate-float"
                >
                    <img
                        src="/images/dashboard.png"
                        alt="Algorithm Visualizer Suite Dashboard"
                        className="w-full h-auto rounded-xl shadow-2xl"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
