import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Link as LinkIcon, Database, Activity, Code, Terminal, Lock } from 'lucide-react';
import api from '../api';

const FAKE_LOGS = [
    "Checking Database Integrity... OK",
    "SSL Certificate: Valid",
    "Monitoring inbound traffic on port 443...",
    "Heuristic engine updated to v3.14.2",
    "No active threats detected in memory",
    "Sandbox environment primed and ready",
    "Cross-referencing global blacklists...",
    "Validating JWT session tokens... OK",
    "Decrypting incoming payload... Success"
];

const useScrambleText = (text) => {
    const [displayText, setDisplayText] = useState('');
    const chars = '!<>-_\\\\/[]{}—=+*^?#________';

    useEffect(() => {
        let iteration = 0;
        let interval = setInterval(() => {
            setDisplayText(() => {
                return text.split('').map((letter, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
            });
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return displayText;
};

const DashboardPage = () => {
    const [userName, setUserName] = useState('AUTHORIZED AGENT');
    const [logs, setLogs] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const navigate = useNavigate();
    const scrambledHeader = useScrambleText("COMMAND CENTER");
    const logsEndRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get('/users/profile');
                if (data && data.name) {
                    setUserName(data.name);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData();
        } else {
            setLoadingProfile(false);
        }

        // Simulate Live Threat Feed
        let logIndex = 0;
        setLogs([FAKE_LOGS[0]]);

        const logInterval = setInterval(() => {
            logIndex = (logIndex + 1) % FAKE_LOGS.length;
            setLogs(prev => {
                const newLogs = [...prev, FAKE_LOGS[logIndex]];
                if (newLogs.length > 5) newLogs.shift();
                return newLogs;
            });
        }, 2500);

        return () => clearInterval(logInterval);
    }, []);

    const springTransition = { type: "spring", stiffness: 100, damping: 20, duration: 0.8 };

    const pageTransition = { duration: 0.35, ease: "easeOut" };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { ...pageTransition, staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: pageTransition }
    };

    const handleProtectedNavigation = (path) => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
        else navigate(path);
    };

    if (loadingProfile) {
        return (
            <div className="flex h-screen items-center justify-center pt-24 bg-transparent">
                <div className="w-10 h-10 border-4 border-violet dark:border-lavender border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl w-[95%] mx-auto h-full flex flex-col pt-24 px-4 pb-8 relative min-h-screen font-sans">
            <style>{`
                @keyframes drift {
                    from { background-position: 0 0; }
                    to { background-position: 40px 40px; }
                }
                .animate-drift {
                    animation: drift 3s linear infinite;
                }
                @keyframes radar-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                .animate-radar::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid #8A2BE2;
                    animation: radar-pulse 2s cubic-bezier(0.0, 0, 0.2, 1) infinite;
                }
            `}</style>

            {/* Matrix Layer Background */}
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none animate-drift"
                style={{ backgroundImage: 'radial-gradient(circle, #8A2BE2 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}>
            </div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="flex flex-col h-full z-10 space-y-10 flex-1">

                {/* 1. Hero / Command Center Greeting */}
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mt-6 overflow-visible">
                    <h1 className="text-5xl md:text-6xl font-black font-mono tracking-widest text-white drop-shadow-md text-center mb-6">
                        {scrambledHeader}
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.2 }}
                        className="text-xl text-white/80 max-w-2xl text-center mb-6 font-mono text-sm uppercase tracking-wide"
                    >
                        Identity confirmed: <span className="text-lavender font-bold">{userName.toUpperCase()}</span> // Secure uplink established.
                    </motion.p>

                    <div className="flex gap-6 items-center justify-center font-mono">
                        <div className="glass-card bg-light-mixed px-6 py-2 flex items-center gap-3 shadow-[0_0_10px_rgba(0,0,0,0.05)] border-violet/20" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}>
                            <Database size={16} className="text-lavender" />
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Storage: Online</span>
                            </div>
                        </div>
                        <div className="glass-card bg-light-mixed px-6 py-2 flex items-center gap-3 border-deepPurple/50 shadow-[0_0_10px_rgba(0,0,0,0.05)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}>
                            <Activity size={16} className="text-violet" />
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Network: Stable</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Interactive Security Widgets - Live Threat Feed */}
                <motion.div variants={itemVariants} className="w-full max-w-4xl mx-auto glass-card bg-black/40 border border-white/10 shadow-[0_0_30px_rgba(138,43,226,0.15)] overflow-hidden rounded-xl" style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)' }}>
                    <div className="bg-black/40 px-6 py-3 border-b border-white/10 flex items-center gap-3">
                        <Terminal size={18} className="text-lavender" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">System Log [Live]</h2>
                    </div>
                    <div className="p-6 space-y-3 h-48 flex flex-col justify-end font-mono text-xs overflow-hidden bg-black/20">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i + log}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 text-white/70"
                            >
                                <span className="text-violet/60">[{new Date().toLocaleTimeString()}]</span>
                                <Code size={14} className="text-lavender/50" />
                                <span>{log}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 3. Bottom Navigation - Execution Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto pb-12 mt-auto">

                    {/* Card 1: URL INTELLIGENCE */}
                    <motion.div
                        whileHover={{ scale: 1.02, transition: { duration: 0.35, ease: "easeOut" } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProtectedNavigation('/url-scan')}
                        className="group block cursor-pointer"
                    >
                        <div className="bg-black/40 backdrop-blur-xl p-8 h-full border border-violet/30 transition-all duration-500 relative overflow-hidden hover:bg-violet/10 hover:border-violet" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 85%, 95% 100%, 0 100%, 0 15%)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet/20 blur-3xl rounded-full"></div>

                            {/* Cybersecurity SVG Watermark */}
                            <svg className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 text-violet pointer-events-none group-hover:scale-110 transition-transform duration-700" viewBox="0 0 100 100" fill="currentColor">
                                <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0ZM50 8.6L14.2 29.3V70.7L50 91.4L85.8 70.7V29.3L50 8.6Z" />
                                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                            </svg>

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="relative w-16 h-16 rounded-full bg-violet/10 border border-violet/40 flex items-center justify-center text-violet shadow-[0_0_20px_rgba(138,43,226,0.3)] animate-radar">
                                    <LinkIcon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-widest shadow-black drop-shadow-md">URL Intelligence</h3>
                                    <p className="text-white/60 leading-relaxed font-mono text-xs tracking-wide">
                                        Scan and map external endpoints against the VirusTotal neural network. Detect malicious payloads before execution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: FILE SANDBOX */}
                    <motion.div
                        whileHover={{ scale: 1.02, transition: { duration: 0.35, ease: "easeOut" } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProtectedNavigation('/file-scan')}
                        className="group block cursor-pointer"
                    >
                        <div className="bg-black/40 backdrop-blur-xl p-8 h-full border border-lavender/30 transition-all duration-500 relative overflow-hidden hover:bg-lavender/10 hover:border-lavender" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 15%, 100% 100%, 5% 100%, 0 85%)' }}>

                            {/* Holographic Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen"
                                style={{ background: 'linear-gradient(45deg, transparent 40%, rgba(138,43,226,0.6) 50%, transparent 60%)', backgroundSize: '200% 200%', animation: 'hologramSweep 3s infinite linear' }}>
                            </div>

                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-lavender/20 blur-3xl rounded-full"></div>

                            {/* Cybersecurity SVG Watermark */}
                            <svg className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.08] text-lavender pointer-events-none group-hover:rotate-12 transition-transform duration-700" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="50" cy="50" r="40" strokeDasharray="10 5" />
                                <circle cx="50" cy="50" r="30" strokeDasharray="5 10" />
                                <path d="M50 10 L50 90 M10 50 L90 50" opacity="0.5" />
                            </svg>

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-lg bg-lavender/10 border border-lavender/40 flex items-center justify-center text-lavender shadow-[0_0_20px_rgba(230,230,250,0.3)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-widest shadow-black drop-shadow-md">File Sandbox</h3>
                                    <p className="text-white/60 leading-relaxed font-mono text-xs tracking-wide">
                                        Isolate and detonate suspicious binaries in a secure micro-VM. Analyze structural heuristics safely.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: IMAGE VAULT */}
                    <motion.div
                        whileHover={{ scale: 1.02, transition: { duration: 0.35, ease: "easeOut" } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProtectedNavigation('/vault')}
                        className="group block cursor-pointer md:col-span-2"
                    >
                        <div className="bg-black/40 backdrop-blur-xl p-8 h-full border border-pink-500/30 transition-all duration-500 relative overflow-hidden group-hover:bg-pink-500/10 group-hover:border-pink-500" style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full"></div>

                            {/* Cybersecurity SVG Watermark */}
                            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.04] text-pink-500 pointer-events-none group-hover:opacity-[0.08] transition-all duration-700" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="20" y="20" width="160" height="160" rx="20" opacity="0.5" />
                                <rect x="40" y="40" width="120" height="120" rx="10" strokeDasharray="10 5" />
                                <circle cx="100" cy="100" r="30" />
                                <path d="M100 50 L100 70 M100 130 L100 150 M50 100 L70 100 M130 100 L150 100" strokeWidth="2" />
                            </svg>

                            <div className="flex flex-col gap-6 relative z-10 items-center text-center">
                                <div className="relative w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
                                    <Lock size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-widest shadow-black drop-shadow-md">Image Vault</h3>
                                    <p className="text-white/60 leading-relaxed font-mono text-xs tracking-wide max-w-2xl mx-auto">
                                        Military-grade AES-256-CBC image encryption. Protect visual assets using PBKDF2 derived PIN authentication. Secure payload deployment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
