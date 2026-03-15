import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, UserCircle, LogOut } from 'lucide-react';
import api from '../api';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Re-check auth whenever local storage changes or route changes. 
    // In a real app we'd use a Context Provider, but for this simpler layout, we just check token.
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setIsLoggedIn(true);
                try {
                    // Fetch user info silently to populate avatar
                    const { data } = await api.get('/users/profile');
                    if (data.profilePicUrl) setAvatarUrl(data.profilePicUrl);
                } catch (e) { } // Ignore on fail
            } else {
                setIsLoggedIn(false);
                setAvatarUrl('');
            }
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className={`fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-500 rounded-none border-x-0 border-t-0 border-b border-white/10 backdrop-blur-xl ${scrolled ? 'bg-deepPurple/40 shadow-[0_0_30px_rgba(138,43,226,0.3)]' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Brand / Logo */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender to-violet flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.6)]">
                            <span className="text-white font-bold text-lg leading-none">P</span>
                        </div>
                        <span className="text-lg md:text-xl font-bold text-white drop-shadow-md hidden sm:block">
                            APT-Project Pro
                        </span>
                    </Link>
                </motion.div>

                {/* Auth Controls */}
                <div className="flex items-center gap-4">



                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-lavender hover:text-white cursor-pointer transition-colors px-2 md:px-3 py-2 rounded-lg hover:bg-white/5"
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="md:w-6 md:h-6 w-5 h-5 rounded-full object-cover border border-lavender/50" />
                                    ) : (
                                        <UserCircle size={20} className="md:w-6 md:h-6" />
                                    )}
                                    <span className="font-medium text-sm md:text-base hidden sm:block">Profile</span>
                                </Link>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 glass-button !border-red-500/30 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all rounded-lg text-sm md:text-base"
                            >
                                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                                <span className="hidden sm:block">Logout</span>
                            </motion.button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 text-sm md:text-base"
                                >
                                    <LogIn size={16} className="md:w-[18px] md:h-[18px]" />
                                    <span className="hidden sm:block">Login</span>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 glass-button shadow-[0_0_15px_rgba(230,230,250,0.3)] hover:shadow-[0_0_20px_rgba(230,230,250,0.5)] transition-all rounded-lg text-sm md:text-base"
                                >
                                    <UserPlus size={16} className="md:w-[18px] md:h-[18px]" />
                                    <span className="hidden sm:block">Register</span>
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Navbar;
