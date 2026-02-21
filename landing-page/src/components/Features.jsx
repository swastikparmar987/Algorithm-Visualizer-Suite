import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Code, Layout, Cpu } from 'lucide-react';

const features = [
    {
        icon: <Shield className="size-6 text-purple-400" />,
        title: "Secure 2FA Gateway",
        description: "Hardened authentication with mandatory OTP verification for every sign-in attempt."
    },
    {
        icon: <Brain className="size-6 text-cyan-400" />,
        title: "AlgoBot Gemini AI",
        description: "Real-time algorithmic insights and strategic hints powered by Gemini 2.5 Flash."
    },
    {
        icon: <Code className="size-6 text-pink-400" />,
        title: "Practice Engine",
        description: "LeetCode-style environment with Monaco editor and automated test-case runner."
    },
    {
        icon: <Zap className="size-6 text-yellow-400" />,
        title: "GPU Accelerated",
        description: "Buttery smooth 60fps visualizations with forced hardware acceleration."
    },
    {
        icon: <Layout className="size-6 text-blue-400" />,
        title: "Cyber-Industrial UI",
        description: "Sleek, void-themed interface with glassmorphism and neon accents."
    },
    {
        icon: <Cpu className="size-6 text-green-400" />,
        title: "Multi-Module Suite",
        description: "Comprehensive coverage from Sorting and Graphs to Automata and DP."
    }
];

const Features = () => {
    return (
        <section id="features" className="py-20 px-6 bg-[#080808]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Elite <span className="neon-text">Capabilities</span></h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Engineered for performance. Built for clarity. Master the world of algorithms with the most powerful visualizer ever created.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="glass-panel p-8 hover:border-purple-500/50 transition-colors group"
                        >
                            <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg group-hover:bg-purple-500/10 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
