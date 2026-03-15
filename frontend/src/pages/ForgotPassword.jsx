import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-card w-full max-w-md p-8 relative overflow-hidden"
            >
                {/* Subtle decorative glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet to-lavender"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-deepPurple/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(75,0,130,0.6)]">
                        <ShieldAlert size={32} className="text-lavender" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Forgot Password</h2>
                <p className="text-white/60 text-center mb-8">Enter your registered email address to receive a password reset link.</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#FF1744]/10 border border-[#FF1744]/70 text-[#FF1744] p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.7)] text-[#39FF14] p-3 rounded-lg mb-6 text-sm text-center">
                        {message}
                    </motion.div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="glass-input pl-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="glass-button flex justify-center items-center h-12" disabled={loading || !email}>
                            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Send Mail'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-lavender hover:text-white transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
