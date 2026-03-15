import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(data.message || 'Password reset successfully');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
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
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <ShieldCheck size={32} className="text-lavender" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Reset Password</h2>
                <p className="text-white/60 text-center mb-8">Enter your new password below to regain access.</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg mb-6 text-sm text-center">
                        <p>{message}</p>
                        <p className="mt-2 text-xs opacity-80">Redirecting to login in 3 seconds...</p>
                    </motion.div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                            <input
                                type="password"
                                placeholder="New Password"
                                className="glass-input pl-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className="glass-input pl-12"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="glass-button flex justify-center items-center h-12" disabled={loading || !password || !confirmPassword}>
                            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-lavender hover:text-white transition-colors">
                        Go to Login page
                        <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
