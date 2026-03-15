import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ScanSearch, AlertCircle } from 'lucide-react';
import api from '../api';
import { useApi } from '../hooks/useApi';

const UrlScanner = ({ onScanComplete }) => {
    const [url, setUrl] = useState('');
    const { loading, result, error, execute } = useApi();

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url) return;

        try {
            await execute(
                api.post('/scans/url', { url }),
                () => {
                    if (onScanComplete) onScanComplete();
                    setUrl('');
                }
            );
        } catch (err) {
            // Error state is handled by the hook
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="glass-card bg-black/40 p-6 border-t-4 border-t-violet"
        >
            <div className="flex items-center gap-3 mb-4">
                <Link2 className="text-lavender" />
                <h3 className="text-xl font-semibold text-white">URL Scanner</h3>
            </div>
            <p className="text-lavender/80 text-sm mb-4">Analyze a URL for phishing or malicious intent.</p>

            <form onSubmit={handleScan} className="flex flex-col gap-4">
                <input
                    type="url"
                    placeholder="https://example.com"
                    className="glass-input bg-black/40"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[#FF1744] bg-[#FF1744]/10 border border-[#FF1744]/60 rounded-lg p-3 text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    type="submit"
                    className="glass-button flex justify-center items-center gap-2"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(138,43,226,0.3)" }}
                    whileTap={{ scale: 0.98, boxShadow: "0 0 10px rgba(138,43,226,0.5)" }}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <><ScanSearch size={18} /> Analyze URL</>
                    )}
                </motion.button>
            </form>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className={`mt-6 p-5 rounded-2xl glass-card bg-black/40 border ${result.riskLevel === 'Safe'
                            ? 'border-[rgba(57,255,20,0.6)] shadow-[0_0_22px_rgba(57,255,20,0.35)]'
                            : result.riskLevel === 'Suspicious'
                                ? 'border-yellow-400/70 shadow-[0_0_18px_rgba(250,204,21,0.3)]'
                                : 'border-[rgba(255,23,68,0.75)] shadow-[0_0_22px_rgba(255,23,68,0.45)]'
                        }`}
                    >
                        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
                            <div>
                                <span className="text-sm text-lavender/80 block mb-1 uppercase tracking-widest font-mono">Overall Assessment</span>
                                <span
                                    className={`px-4 py-1.5 rounded-full font-bold tracking-widest uppercase text-sm border ${
                                        result.riskLevel === 'Safe'
                                            ? 'bg-[rgba(57,255,20,0.08)] border-[rgba(57,255,20,0.7)] text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.55)]'
                                            : result.riskLevel === 'Suspicious'
                                                ? 'bg-yellow-400/10 border-yellow-400/70 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.4)]'
                                                : 'bg-[rgba(255,23,68,0.08)] border-[rgba(255,23,68,0.8)] text-[#FF1744] shadow-[0_0_20px_rgba(255,23,68,0.6)]'
                                    }`}
                                >
                                    {result.riskLevel}
                                </span>
                            </div>
                        </div>

                        {/* Intelligence Brief Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Card A: Identity */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors">
                                <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-3 border-b border-white/10 pb-2">Identity</h4>
                                <div className="space-y-1">
                                    <span className="block text-sm text-white/90 truncate"><span className="text-lavender/70 text-xs">Domain:</span> {result.domainName || result.target}</span>
                                    <span className="block text-sm text-white/90 truncate"><span className="text-lavender/70 text-xs">Registrar:</span> {result.registrar || 'Unknown'}</span>
                                    <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">Age:</span> {result.domainAge || 'Unknown'}</span>
                                </div>
                            </motion.div>

                            {/* Card B: Security */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors">
                                <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-3 border-b border-white/10 pb-2">Security</h4>
                                <div className="space-y-1">
                                    <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">SSL:</span> {result.sslStatus ? <span className="text-[#39FF14]">Valid</span> : <span className="text-[#FF1744]">Invalid</span>}</span>
                                    <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">HSTS:</span> {result.hsts ? <span className="text-[#39FF14]">Active</span> : <span className="text-lavender/50">Inactive</span>}</span>
                                    <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">CSP:</span> {result.csp ? <span className="text-[#39FF14]">Active</span> : <span className="text-lavender/50">Inactive</span>}</span>
                                </div>
                            </motion.div>

                            {/* Card C: Network */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors">
                                <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-3 border-b border-white/10 pb-2">Network</h4>
                                <div className="space-y-1">
                                    <span className="block text-sm text-white/90 truncate"><span className="text-lavender/70 text-xs">Target IP:</span> {result.ip || 'Unknown'}</span>
                                    <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">City:</span> {result.location ? result.location.city : 'Unknown'}</span>
                                    <span className="block text-sm text-white/90 flex gap-2 items-center"><span className="text-lavender/70 text-xs">Country:</span> {result.location ? result.location.country : 'Unknown'} 🏳️</span>
                                </div>
                            </motion.div>
                        </div>

                        <p className="text-sm text-lavender/80 mb-4 bg-white/5 p-3 rounded-lg border border-white/10">{result.details}</p>

                        {result.threatTable && result.threatTable.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/80 mb-3">Threat Engine Results</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {result.threatTable.map((threat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex justify-between items-center"
                                        >
                                            <span className="text-sm font-medium text-white/90">{threat.engine}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                threat.result === 'clean' || threat.result === 'unrated'
                                                    ? 'bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.7)] text-[#39FF14]'
                                                    : 'bg-[rgba(255,23,68,0.1)] border border-[rgba(255,23,68,0.8)] text-[#FF1744]'
                                                }`}>
                                                {threat.result.toUpperCase()}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UrlScanner;
