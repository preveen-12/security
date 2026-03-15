
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Shield, Link2, Vault, UserCircle, Link, FileSearch, LogOut, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'URL Scanner', path: '/url-scan', icon: Link },
        { name: 'File Sandbox', path: '/file-scan', icon: FileSearch },
        { name: 'Image Vault', path: '/vault', icon: Lock },
        { name: 'My History', path: '/history', icon: LayoutDashboard },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="w-64 h-screen fixed left-0 top-20 glass-card rounded-none border-l-0 border-y-0 flex flex-col pt-8 pb-32">
            <div className="px-6 mb-10">
                <h1 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
                    Tools & History
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 relative">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(230,230,250,0.1)] border-white/20'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            } `
                        }
                    >
                        {({ isActive }) => (
                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 relative z-10 w-full">
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-lavender' : 'text-white/50 group-hover:text-lavender/70'} `} />
                                <span>{item.name}</span>
                            </motion.div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 mt-auto">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 border border-transparent hover:border-white/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </motion.button>
            </div>
        </div>
    );
};

export default Sidebar;
