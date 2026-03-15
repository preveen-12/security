import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, _id: data._id }));
            localStorage.setItem('token', data.token); // Store token for Navbar visibility
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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

                <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-white/60 text-center mb-8">Secure Access Portal</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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
                        />
                    </div>

                    <div className="flex justify-end -mt-2">
                        <Link to="/forgot-password" className="text-sm text-lavender hover:text-white transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="glass-button flex justify-center items-center h-12" disabled={loading}>
                        {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-white/60 text-sm">
                    Don't have an account? <Link to="/register" className="text-lavender hover:text-white transition-colors">Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
