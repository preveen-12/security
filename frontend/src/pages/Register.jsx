import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import api from '../api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            console.log('Attempting login at:', import.meta.env.VITE_API_URL);
            const { data } = await api.post('/auth/register', { name, email, password });
            // Email must be passed to verify OTP page
            navigate('/verify-otp', { state: { email: data.email || email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-card w-full max-w-md p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-violet to-lavender"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <UserPlus size={32} className="text-lavender" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
                <p className="text-white/60 text-center mb-8">Join the Secure Network</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="glass-input pl-12"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="glass-input pl-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="glass-button mt-4 h-12 flex justify-center items-center" disabled={loading}>
                        {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Register & Send OTP'}
                    </button>
                </form>

                <p className="mt-6 text-center text-white/60 text-sm">
                    Already have an account? <Link to="/login" className="text-lavender hover:text-white transition-colors">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
