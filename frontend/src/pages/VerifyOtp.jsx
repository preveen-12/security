import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import api from '../api';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [resendCooldown, setResendCooldown] = useState(25);
    const [resendDisabled, setResendDisabled] = useState(true);

    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        let timer;
        if (resendDisabled && resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        } else if (resendCooldown === 0) {
            setResendDisabled(false);
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [resendDisabled, resendCooldown]);

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setMessage(data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendDisabled) return;
        setError('');
        setMessage('');
        try {
            const { data } = await api.post('/auth/resend-otp', { email });
            setMessage(data.message);
            setResendDisabled(true);
            setResendCooldown(25);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-card w-full max-w-md p-8 relative overflow-hidden"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <KeyRound size={32} className="text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Verify Account</h2>
                <p className="text-white/60 text-center mb-8">Enter the 6-digit OTP sent to {email}</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {message}
                    </motion.div>
                )}

                <form onSubmit={handleVerify} className="space-y-5">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="000000"
                            className="glass-input text-center text-2xl tracking-[0.5em] pb-2 font-mono"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <button type="submit" className="glass-button h-12 flex justify-center items-center" disabled={loading}>
                            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Verify OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className={`w-full py-2 text-sm font-medium rounded-lg transition-all ${resendDisabled
                                ? 'text-white/40 cursor-not-allowed border border-transparent'
                                : 'text-lavender hover:text-white border border-lavender/30 hover:bg-lavender/10 shadow-[0_0_10px_rgba(230,230,250,0)] hover:shadow-[0_0_15px_rgba(230,230,250,0.4)]'
                                }`}
                        >
                            {resendDisabled ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
