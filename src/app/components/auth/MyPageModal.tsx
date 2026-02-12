import React, { useState } from 'react';
import { X, User, Mail, Lock, LogOut, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
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
                </div>

                <div className="p-6 space-y-6">
                    {/* User ID / Email Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <Mail className="text-purple-600" size={16} />
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address / ID</h3>
                        </div>

                        <form onSubmit={handleUpdateEmail} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder={user.email}
                            />
                            <button
                                type="submit"
                                disabled={isUpdatingEmail || email === user.email || !email}
                                className="bg-purple-100 text-purple-700 p-3 rounded-xl hover:bg-purple-200 disabled:opacity-40 disabled:hover:bg-purple-100 transition-all"
                                title="Update Email"
                            >
                                {isUpdatingEmail ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
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
                                {isUpdatingPassword ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            </button>
                        </form>
                    </section>

                    {/* Action Footer */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            onClick={() => {
                                const confirmLogout = window.confirm("Are you sure you want to log out?");
                                if (confirmLogout) logout();
                            }}
                            className="w-full bg-gray-50 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-red-50 hover:text-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
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
