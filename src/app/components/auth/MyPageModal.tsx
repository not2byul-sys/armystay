import React, { useState } from 'react';
import { X, User, Mail, Lock, LogOut, CheckCircle2, AlertCircle, Loader2, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export const MyPageModal = () => {
    const {
        user,
        showMyPageModal,
        setShowMyPageModal,
        updateEmail,
        updatePassword,
        logout
    } = useAuth();

    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    if (!showMyPageModal || !user) return null;

    // Detect Google login
    const isGoogleUser = user?.app_metadata?.provider === 'google';

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || email === user.email) return;
        setIsUpdatingEmail(true);
        try {
            await updateEmail(email);
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await updatePassword(password);
            setPassword('');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
                onClick={() => setShowMyPageModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative z-10"
            >
                {/* Header Section */}
                <div className="bg-purple-700 p-8 pt-10 text-center text-white relative">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                        <User size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">My Profile</h2>
                    <p className="text-purple-100/80 text-sm font-medium">Manage your ARMY Stay account</p>

                    <button
                        onClick={() => setShowMyPageModal(false)}
                        className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <button
                        onClick={() => {
                            const confirmLogout = window.confirm("Are you sure you want to log out?");
                            if (confirmLogout) {
                                logout();
                                setShowMyPageModal(false);
                            }
                        }}
                        className="absolute top-6 left-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User ID / Email Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <Mail className="text-purple-600" size={16} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address / ID</h3>
                        </div>

                        {isGoogleUser && (
                            <div className="flex items-center gap-2 px-1 mb-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-xs text-blue-600 font-medium">Signed in with Google</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateEmail} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isGoogleUser}
                                className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${isGoogleUser ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                placeholder={user.email}
                                title={isGoogleUser ? 'Email cannot be changed for Google accounts' : ''}
                            />
                            <button
                                type="submit"
                                disabled={isUpdatingEmail || email === user.email || !email || isGoogleUser}
                                className="bg-purple-100 text-purple-700 p-3 rounded-xl hover:bg-purple-200 disabled:opacity-40 disabled:hover:bg-purple-100 transition-all"
                                title="Update Email"
                            >
                                {isUpdatingEmail ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            </button>
                        </form>
                    </section>

                    {/* Password Section */}
                    <section className="space-y-4 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <Lock className="text-purple-600" size={16} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Change Password</h3>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="flex gap-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder="New password (min 6 char)"
                            />
                            <button
                                type="submit"
                                disabled={isUpdatingPassword || !password}
                                className="bg-purple-100 text-purple-700 p-3 rounded-xl hover:bg-purple-200 disabled:opacity-40 disabled:hover:bg-purple-100 transition-all"
                                title="Update Password"
                            >
                                {isUpdatingPassword ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Helper Tip */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">
                        Hand-picked for ARMYs with 💜
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
