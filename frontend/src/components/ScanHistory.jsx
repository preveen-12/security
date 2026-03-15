import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldOff, ShieldAlert, ShieldCheck, Link2, File, Camera } from 'lucide-react';

const ScanHistory = ({ scans }) => {

    const getRiskIcon = (level) => {
        switch (level) {
            case 'Safe': return <ShieldCheck className="text-white" size={18} />;
            case 'Suspicious': return <ShieldAlert className="text-white" size={18} />;
            case 'Malicious': return <ShieldOff className="text-white" size={18} />;
            default: return null;
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'Safe': return 'text-white bg-green-500/20 border-green-500 shadow-[0_0_10px_#00FF00]';
            case 'Suspicious': return 'text-white bg-yellow-500/20 border-yellow-500 shadow-[0_0_10px_#FFFF00]';
            case 'Malicious': return 'text-white bg-red-500/20 border-red-500 shadow-[0_0_10px_#FF0000]';
            default: return 'text-white bg-white/10 border-white/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true, margin: "-50px" }}
            className="glass-card h-full p-6 flex flex-col"
        >
            <div className="flex items-center gap-3 mb-6">
                <Activity className="text-white" />
                <h3 className="text-xl font-semibold text-white">Recent Scan History</h3>
            </div>

            <div className="flex-1 overflow-x-auto">
                {scans.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-lavender pt-10">
                        <Activity size={48} className="mb-4 opacity-80 text-lavender" />
                        <p className="text-white font-mono">No scan history found.</p>
                        <p className="text-sm font-mono text-lavender mt-2">Initiate a URL or File scan to see results here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scans.map((scan, index) => (
                            <motion.div
                                key={scan._id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-lavender/50 transition-colors flex flex-col gap-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 overflow-hidden">
                                        <div className="mt-1">
                                            {scan.type === 'url' ? <Link2 className="text-lavender" size={20} /> : scan.type === 'file' ? <File className="text-lavender" size={20} /> : <Camera className="text-lavender" size={20} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium truncate text-white text-lg" title={scan.target}>{scan.target}</p>
                                            <p className="text-xs text-white font-mono mt-1">{new Date(scan.createdAt).toLocaleString()} | {scan.type.toUpperCase()}</p>
                                            <p className="text-xs text-white mt-1.5 line-clamp-1">{scan.details}</p>
                                        </div>
                                    </div>

                                    <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold tracking-widest uppercase ${getRiskColor(scan.riskLevel)}`}>
                                        {getRiskIcon(scan.riskLevel)}
                                        {scan.riskLevel}
                                    </div>
                                </div>

                                {/* Condensed Intelligence Brief */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 pt-4 border-t border-white/10">
                                    {scan.type === 'url' ? (
                                        <>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Domain Age</span>
                                                <span className="text-sm text-white font-mono">{scan.domainAge || 'Unknown'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center flex flex-col items-center justify-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">SSL Status</span>
                                                <span className="text-sm text-white font-mono">{scan.sslStatus ? 'Valid' : 'Invalid'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Geolocation</span>
                                                <span className="text-sm text-white font-mono truncate px-1 block">{scan.location && scan.location.city !== 'Unknown' ? `${scan.location.city}, ${scan.location.country}` : 'Unknown'}</span>
                                            </div>
                                        </>
                                    ) : scan.type === 'metadata' ? (
                                        <>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Make/Model</span>
                                                <span className="text-sm text-white font-mono truncate px-1 block" title={scan.cameraModel}>{scan.cameraModel || 'Unknown'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Geotag</span>
                                                <span className="text-sm text-white font-mono block">{scan.gps ? 'FOUND' : 'WIPED'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Stego Risk</span>
                                                <span className="text-sm text-white font-mono block">{scan.steganographyRisk || 'Low'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">SHA-256</span>
                                                <span className="text-sm text-white font-mono truncate block px-2" title={scan.sha256}>{scan.sha256 ? `${scan.sha256.substring(0, 10)}...` : 'N/A'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">MIME Type</span>
                                                <span className="text-sm text-white font-mono truncate block px-2">{scan.mimeType || 'Unknown'}</span>
                                            </div>
                                            <div className="rounded p-2 text-center">
                                                <span className="block text-[10px] text-lavender font-bold uppercase tracking-widest mb-1">Detection</span>
                                                <span className="text-sm text-white font-mono block">{scan.detectionRatio || '0/72'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ScanHistory;
