import React from 'react';
import { motion } from 'framer-motion';

const screenshots = [
    {
        src: "/images/dashboard.png",
        title: "System Core",
        desc: "A centralized hub for all algorithmic operations and user metrics."
    },
    {
        src: "/images/practice.webp",
        title: "Battle Ground",
        desc: "Master coding challenges in an immersive development environment."
    },
    {
        src: "/images/auth.png",
        title: "Secure Perimeter",
        desc: "Hardened authentication featuring mandatory 2FA security."
    }
];

const Gallery = () => {
    return (
        <section id="downloads" className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Command <span className="neon-text">Interface</span></h2>
                    <p className="text-gray-400 max-w-xl mx-auto">A visual tour of the suite's high-fidelity environments.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        {screenshots.map((shot, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="glass-panel p-6 border-l-4 border-l-purple-500 hover:bg-white/5 transition-all cursor-default"
                            >
                                <h3 className="text-xl font-bold mb-1 text-white">{shot.title}</h3>
                                <p className="text-gray-400 text-sm">{shot.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-2 shadow-2xl overflow-hidden"
                        >
                            <img src="/images/practice.webp" alt="Practice Interface" className="w-full h-auto rounded-lg" />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-2 shadow-xl overflow-hidden"
                            >
                                <img src="/images/auth.png" alt="Auth Interface" className="w-full h-auto rounded-lg" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-2 shadow-xl overflow-hidden"
                            >
                                <img src="/images/dashboard.png" alt="Dashboard Interface" className="w-full h-auto rounded-lg" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;
