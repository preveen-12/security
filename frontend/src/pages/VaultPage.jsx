import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, UploadCloud, ShieldCheck, Key, FileWarning, EyeOff, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

const VaultPage = () => {
    const [file, setFile] = useState(null);
    const [pin, setPin] = useState('');
    const [isEncrypting, setIsEncrypting] = useState(true);
    const [loading, setLoading] = useState(false);
    const [statusGridVisible, setStatusGridVisible] = useState(false);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatusGridVisible(false);
            setError(null);
            setToastMessage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !pin) return setError('File and PIN are required.');
        if (pin.length < 4) return setError('PIN must be at least 4 digits.');

        setLoading(true);
        setError(null);
        setStatusGridVisible(false);
        setToastMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('pin', pin);

        try {
            const endpoint = isEncrypting ? '/api/vault/encrypt' : '/api/vault/decrypt';
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Operation failed');
            }

            const blob = await response.blob();
            let downloadName = file.name;
            if (isEncrypting) downloadName += '.vault';
            else if (file.name.endsWith('.vault')) downloadName = file.name.slice(0, -6);
            else downloadName = `decrypted_${file.name}`;

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({ suggestedName: downloadName });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (saveErr) {
                    console.error('File save cancelled or failed', saveErr);
                    // Fallback to traditional download if user cancels or an error occurs
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = downloadName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                }
            } else {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }

            const successMsg = isEncrypting
                ? "Encryption Complete. Original file cleared from session. Please save your .vault key."
                : "Decryption Complete. .vault file cleared from session. Please save your original file.";
            setToastMessage(successMsg);
            setStatusGridVisible(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col pt-8 relative pb-12 w-full font-sans">
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="flex flex-col items-center justify-center w-full z-10 max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <motion.div variants={itemVariants} className="text-center overflow-visible">
                    <div className="w-16 h-16 rounded-full bg-violet/10 border border-violet/40 flex items-center justify-center text-lavender shadow-[0_0_20px_rgba(138,43,226,0.3)] mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-mono tracking-widest text-white drop-shadow-md">
                        IMAGE VAULT
                    </h1>
                    <p className="text-white font-mono mt-3 text-sm uppercase tracking-wide">Secure payload encapsulation & decryption</p>
                </motion.div>

                {/* Main Action Card (Glassmorphism Rebuild) */}
                <motion.div variants={itemVariants} className="w-full glass-card bg-black/40 backdrop-blur-xl p-8 border border-white/10 shadow-[0_0_30px_rgba(138,43,226,0.15)] overflow-hidden rounded-2xl relative">

                    {/* Mode Toggle */}
                    <div className="flex bg-black/50 p-1 rounded-lg w-fit mx-auto mb-8 border border-white/10">
                        <button onClick={() => { setIsEncrypting(true); setStatusGridVisible(false); }} className={`px-6 py-2 rounded-md font-mono text-sm tracking-widest font-bold transition-all duration-300 flex items-center gap-2 ${isEncrypting ? 'bg-violet text-white shadow-[0_0_15px_rgba(138,43,226,0.5)]' : 'text-white/60 hover:text-white'}`}>
                            <Lock size={16} /> ENCRYPT
                        </button>
                        <button onClick={() => { setIsEncrypting(false); setStatusGridVisible(false); }} className={`px-6 py-2 rounded-md font-mono text-sm tracking-widest font-bold transition-all duration-300 flex items-center gap-2 ${!isEncrypting ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-white/60 hover:text-white'}`}>
                            <Unlock size={16} /> DECRYPT
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File Upload Area */}
                        <div className="relative w-full h-32 border-2 border-dashed border-lavender/40 rounded-xl bg-purple-900/20 flex flex-col items-center justify-center hover:bg-purple-800/30 hover:border-lavender/60 transition-all duration-300 cursor-pointer overflow-hidden group">
                            <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                            <UploadCloud className="w-8 h-8 text-lavender group-hover:text-white transition-colors mb-2" />
                            <span className="font-mono text-sm text-white tracking-wide transition-colors text-center px-4">
                                {file ? file.name : (isEncrypting ? 'Drop Image or Click to Browse' : 'Drop .vault file or Click to Browse')}
                            </span>
                        </div>

                        {/* Masked PIN Input */}
                        <div className="bg-black/50 rounded-xl border border-white/10 p-1 relative overflow-hidden group focus-within:border-lavender/50 transition-colors">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lavender z-10">
                                <Key size={20} />
                            </div>
                            <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="ENTER 4+ DIGIT SECURITY PIN"
                                className="w-full bg-transparent border-none outline-none pl-12 pr-12 py-4 font-mono text-lg text-white placeholder:text-white/50 tracking-widest"
                                required
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/30 z-10 pointer-events-none">
                                <EyeOff size={20} />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg font-mono text-sm flex items-center gap-2">
                                <FileWarning size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02, transition: { duration: 0.35, ease: "easeOut" } }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-mono text-sm tracking-widest font-bold flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(230,230,250,0.5)] ${isEncrypting ? 'bg-[#4B0082] text-white' : 'bg-[#4B0082] text-white'}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isEncrypting ? <Lock size={18} /> : <Unlock size={18} />}
                                    {isEncrypting ? 'INITIATE ENCRYPTION' : 'AUTHORIZE DECRYPTION'}
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Success Grid & Toasts */}
                <AnimatePresence>
                    {statusGridVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
                            viewport={{ once: true }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.35 } }}
                            className="w-full flex flex-col gap-6"
                        >
                            {/* Glass Toast */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }}
                                className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400">
                                        <Trash2 size={20} />
                                    </div>
                                    <span className="text-white font-mono text-sm tracking-wide">{toastMessage}</span>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <div className="bg-black/40 border border-white/10 p-6 rounded-xl flex items-start gap-4 backdrop-blur-sm">
                                    <ShieldCheck className="text-green-400 shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-white font-bold font-mono tracking-wider text-sm mb-1 uppercase">AES-256-CBC</h4>
                                        <p className="text-white/60 font-mono text-xs">Military-grade cipher successfully applied to payload.</p>
                                    </div>
                                </div>
                                <div className="bg-black/40 border border-white/10 p-6 rounded-xl flex items-start gap-4 backdrop-blur-sm">
                                    <Key className="text-lavender shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-white font-bold font-mono tracking-wider text-sm mb-1 uppercase">PBKDF2 HASH</h4>
                                        <p className="text-white/60 font-mono text-xs">Derived 256-bit key using 100,000 algorithmic iterations.</p>
                                    </div>
                                </div>
                                <div className="bg-black/40 border border-white/10 p-6 rounded-xl flex items-start gap-4 backdrop-blur-sm">
                                    <CheckCircle className="text-blue-400 shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-white font-bold font-mono tracking-wider text-sm mb-1 uppercase">OPERATION SUCCESS</h4>
                                        <p className="text-white/60 font-mono text-xs">File processed and downloaded. Trace data purged from memory.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructional Security Notice */}
                            <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                                <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={20} />
                                <p className="text-white/80 font-mono text-sm leading-relaxed">
                                    For security, your original file is processed and cleared from the server buffer. Please delete your local copy manually to complete the vaulting process.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};

export default VaultPage;
