import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, AlertTriangle, MonitorPlay, AlertCircle } from 'lucide-react';
import api from '../api';
import { useApi } from '../hooks/useApi';

const FileScanner = ({ onScanComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const { loading, result, error, execute } = useApi();
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleScan = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await execute(
                api.post('/scans/file', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }),
                () => {
                    if (onScanComplete) onScanComplete();
                    setFile(null); // Clear file after scan
                }
            );
        } catch (err) {
            // Error is handled by the hook
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card bg-black/40 p-6 border-t-4 border-t-deepPurple"
        >
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-lavender" />
                <h3 className="text-xl font-semibold text-white">Sandbox File Scanner</h3>
            </div>
            <p className="text-lavender/80 text-sm mb-4">Drop a file to simulate sandbox analysis.</p>

            <div
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-violet bg-violet/10 scale-[1.02]' : 'border-violet/40 bg-white/5 hover:border-violet/60'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-violet/20 flex items-center justify-center">
                            <File size={24} className="text-lavender" />
                        </div>
                        <p className="font-medium text-sm text-center max-w-[200px] truncate text-white">{file.name}</p>
                        <p className="text-xs text-lavender/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <UploadCloud size={40} className="text-lavender/70" />
                        <p className="text-lavender/80 text-sm text-center">Drag & drop or <span className="text-lavender font-semibold">Browse</span></p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-[#FF1744] bg-[#FF1744]/10 border border-[#FF1744]/60 rounded-lg p-3 text-sm flex items-center gap-2"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {file && (
                    <form onSubmit={handleScan}>
                        <motion.button
                            type="submit"
                            className="glass-button flex justify-center items-center gap-2 mt-4 w-full h-12"
                            disabled={loading || !file}
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(138,43,226,0.3)" }}
                            whileTap={{ scale: 0.98, boxShadow: "0 0 10px rgba(138,43,226,0.5)" }}
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><MonitorPlay size={18} /> Run Sandbox Analysis</>
                            )}
                        </motion.button>
                    </form>
                )}
            </AnimatePresence>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`mt-6 p-5 rounded-2xl glass-card bg-black/40 border ${
                        result.riskLevel === 'Safe'
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

                    {/* Technical Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        {/* Hashes */}
                        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors">
                            <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-3 border-b border-white/10 pb-2">Signatures</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="block text-[10px] text-lavender/70 uppercase">MD5</span>
                                    <span className="block text-xs font-mono text-white/85 bg-black/40 p-1.5 rounded truncate select-all border border-white/10">{result.md5 || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-lavender/70 uppercase">SHA-256</span>
                                    <span className="block text-xs font-mono text-white/85 bg-black/40 p-1.5 rounded truncate select-all border border-white/10">{result.sha256 || 'N/A'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Metadata */}
                        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors">
                            <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-3 border-b border-white/10 pb-2">Metadata</h4>
                            <div className="space-y-1">
                                <span className="block text-sm text-white/90 truncate"><span className="text-lavender/70 text-xs">MIME:</span> {result.mimeType || 'Unknown'}</span>
                                <span className="block text-sm text-white/90"><span className="text-lavender/70 text-xs">Size:</span> {result.fileSize ? (result.fileSize / 1024).toFixed(2) + ' KB' : 'Unknown'}</span>
                            </div>
                        </motion.div>

                        {/* Engines */}
                        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }} className="glass-card bg-black/40 p-4 border border-violet/40 backdrop-blur-[30px] rounded-xl relative overflow-hidden group hover:border-violet/60 transition-colors flex flex-col items-center justify-center">
                            <h4 className="text-xs uppercase font-mono tracking-widest text-lavender mb-2 border-b border-white/10 pb-2 w-full text-left">Detection</h4>
                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                <span className={`text-4xl font-black tracking-tight ${
                                    result.riskLevel === 'Safe'
                                        ? 'text-[#39FF14] drop-shadow-[0_0_14px_rgba(57,255,20,0.7)]'
                                        : result.riskLevel === 'Suspicious'
                                            ? 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                                            : 'text-[#FF1744] drop-shadow-[0_0_14px_rgba(255,23,68,0.7)]'
                                }`}>{result.detectionRatio || '0/72'}</span>
                                <span className="text-[10px] text-lavender/70 uppercase tracking-widest mt-1">Engines Flagged</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

        </motion.div>
    );
};

export default FileScanner;
