import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Trophy,
    BarChart3,
    Users,
    Zap,
    Shield,
    Globe,
    History,
    X,
    UserCircle,
    Lock,
    Loader2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
    const [handle, setHandle] = useState('');
    const [recent, setRecent] = useState<string[]>([]);
    const navigate = useNavigate();
    const { userHandle, login, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authHandle, setAuthHandle] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const stored = JSON.parse(
            localStorage.getItem('recent_handles') || '[]',
        );
        setRecent(stored);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle.trim()) {
            navigate(`/dashboard/${handle.trim()}`);
        }
    };

    const removeRecent = (handleToRemove: string) => {
        const stored = JSON.parse(
            localStorage.getItem('recent_handles') || '[]',
        );
        const updated = stored.filter(
            (item: string) => item !== handleToRemove,
        );
        localStorage.setItem('recent_handles', JSON.stringify(updated));
        setRecent(updated);
    };






    

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        try {
            const res = await fetch(`/api/auth/${authMode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle: authHandle.trim(), password: authPassword })
            });
            const data = await res.json();
            if (data.success) {
                login(authHandle.trim());
                setIsAuthModalOpen(false);
                setAuthHandle('');
                setAuthPassword('');
                navigate(`/dashboard/${authHandle.trim()}`);
            } else {
                setAuthError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setAuthError('Network error');
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-bg-app selection:bg-brand-primary/30">
            {/* Premium Background Mesh */}
            <div className="mesh-background">
                <div className="w-200 h-200 bg-brand-primary/20 -top-50 -left-50" />
                <div
                    className="w-150 h-150 bg-brand-secondary/15 top-[20%] -right-32"
                    style={{ animationDelay: '-5s' }}
                />
                <div
                    className="w-175 h-175 bg-brand-accent/20 -bottom-75 left-[10%]"
                    style={{ animationDelay: '-10s' }}
                />
            </div>

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
            </div>

            {/* Floating context badges */}
            <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
                {[
                    {
                        label: 'tourist  ·  3979',
                        sub: 'Legendary GM',
                        top: '18%',
                        left: '6%',
                        delay: '0s',
                        color: 'var(--rank-legendary)',
                    },
                    {
                        label: 'Petr  ·  Expert',
                        sub: 'rating 1700',
                        top: '65%',
                        left: '4%',
                        delay: '-4s',
                        color: 'var(--rank-expert)',
                    },
                    {
                        label: 'Um_nik  ·  3602',
                        sub: 'Grandmaster',
                        top: '22%',
                        right: '5%',
                        delay: '-7s',
                        color: 'var(--rank-gm)',
                    },
                    {
                        label: 'neal  ·  Master',
                        sub: 'rating 2218',
                        top: '72%',
                        right: '4%',
                        delay: '-12s',
                        color: 'var(--rank-master)',
                    },
                ].map(({ label, sub, top, left, right, delay, color }) => (
                    <div
                        key={label}
                        className="absolute hidden md:flex flex-col gap-0.5 px-3 py-2 rounded-2xl"
                        style={{
                            top,
                            left,
                            right,
                            animationDelay: delay,
                            background: 'var(--bg-card)',
                            border: `1px solid ${color}28`,
                            backdropFilter: 'blur(16px)',
                            boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px ${color}15`,
                            animation: `float-blob 18s ${delay} infinite alternate cubic-bezier(0.45,0,0.55,1)`,
                            opacity: 0.65,
                        }}
                    >
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: color }}
                            />
                            <span
                                className="text-[10px] font-black text-overline"
                                style={{ color: 'var(--text-main)' }}
                            >
                                {label}
                            </span>
                        </div>
                        <span
                            className="text-[8px] font-bold pl-3"
                            style={{ color, opacity: 0.7 }}
                        >
                            {sub}
                        </span>
                    </div>
                ))}
            </div>

            {/* Auth Button Top Right */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50">
                {userHandle ? (
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={() => navigate(`/dashboard/${userHandle}`)} className="rounded-xl px-4 text-xs">
                            Dashboard
                        </Button>
                        <Button variant="ghost" onClick={logout} className="rounded-xl px-4 text-xs opacity-60 hover:opacity-100">
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button variant="secondary" onClick={() => setIsAuthModalOpen(true)} className="rounded-xl px-4 text-xs flex items-center gap-2">
                        <UserCircle size={14} />
                        Sign In
                    </Button>
                )}
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24">
                <div className="text-center space-y-8 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Zap size={10} className="fill-current" />
                            Advanced Analytics for Competitive Programmers
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-text-app tracking-tight leading-[1.1] px-2">
                            Visualize Your <br className="hidden md:block" />
                            <span className="gradient-text whitespace-nowrap">
                                Coding Excellence.
                            </span>
                        </h1>
                        <p className="mt-6 text-base md:text-lg text-muted-app font-medium leading-relaxed max-w-2xl mx-auto px-4">
                            Transform your Codeforces profile into a premium
                            analytics dashboard. Track rating history, master
                            themes, and analyze your performance with
                            data-driven insights.
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onSubmit={handleSearch}
                        className="flex flex-col md:flex-row gap-3 max-w-xl mx-auto pt-4"
                    >
                        <div className="relative flex-1 group">
                            {/* Glow behind input */}
                            <div
                                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                                style={{ background: 'rgba(79,142,247,0.18)' }}
                            />
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10"
                                style={{ color: 'var(--text-muted)' }}
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Enter Codeforces handle (e.g. tourist)"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="input-glass w-full h-14 pl-12 pr-4 rounded-2xl backdrop-blur-xl relative z-10"
                            />
                        </div>
                        <Button
                            variant="gradient"
                            className="h-14 px-8 rounded-2xl text-sm font-bold uppercase tracking-widest relative z-10"
                        >
                            Generate Stats
                        </Button>
                    </motion.form>

                    {recent.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-wrap items-center justify-center gap-2 pt-4"
                        >
                            <div className="section-label mr-2">
                                <History size={10} />
                                Recent
                            </div>
                            {recent.map((h) => (
                                <div
                                    key={h}
                                    className="inline-flex items-center rounded-full bg-white/10 px-3 py-2 shadow-sm shadow-black/10 transition-all duration-200 hover:shadow-md hover:shadow-black/15"
                                >
                                    <button
                                        onClick={() =>
                                            navigate(`/dashboard/${h}`)
                                        }
                                        className="text-[10px] font-bold uppercase tracking-widest text-text-app transition-colors hover:text-brand-primary"
                                    >
                                        {h}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeRecent(h)}
                                        className="ml-2 w-6 h-6 rounded-full bg-white/10 text-muted-app hover:bg-white/20 hover:text-text-app transition-colors flex items-center justify-center"
                                        aria-label={`Remove ${h} from recent searches`}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-6 pt-12"
                    >
                        {[
                            { icon: Trophy, label: 'Global Ranking' },
                            { icon: BarChart3, label: 'Real-time Stats' },
                            { icon: Users, label: 'Comparison Engine' },
                        ].map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="badge badge-primary opacity-60 hover:opacity-100 transition-opacity cursor-default"
                            >
                                <Icon size={10} />
                                {label}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 md:mt-32 px-2 md:px-0">
                    <FeatureCard
                        icon={BarChart3}
                        title="Rating Intelligence"
                        desc="Deep dive into your rating history with interactive charts and growth predictions based on contest trends."
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Skill Heatmap"
                        desc="Visualize your problem-solving velocity across different ranks and themes with our GitHub-style heatmap."
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Public Dashboards"
                        desc="Generate beautiful, shareable profile pages optimized for performance and visual impact."
                    />
                </div>
            </main>

            <footer className="relative z-10 pt-12 pb-28 md:py-12 px-6 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-white text-xs">
                            CF
                        </div>
                        <span className="text-xs font-display font-bold text-text-app tracking-tight">
                            Visualizer
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-app font-mono uppercase tracking-[0.2em]">
                        Created by Nafiz Kamal Talha
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/Nafiz-365/cf-visualizer-project"
                            className="text-muted-app hover:text-text-app transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                            Github
                        </a>
                        <a
                            href="#"
                            className="text-muted-app hover:text-text-app transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                            Privacy
                        </a>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AnimatePresence>
                {isAuthModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsAuthModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md glass-premium p-6 md:p-8 rounded-3xl relative"
                        >
                            <button
                                onClick={() => setIsAuthModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-muted-app hover:text-text-app hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-display font-bold text-text-app">
                                    {authMode === 'login' ? 'Welcome Back' : 'Claim Handle'}
                                </h2>
                                <p className="text-xs text-muted-app mt-2">
                                    {authMode === 'login' 
                                        ? 'Sign in to access your chat history and friends list.'
                                        : 'Register to claim this Codeforces handle as yours.'}
                                </p>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-app ml-1">Codeforces Handle</label>
                                    <div className="relative">
                                        <UserCircle size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-app" />
                                        <input
                                            type="text"
                                            required
                                            value={authHandle}
                                            onChange={(e) => setAuthHandle(e.target.value)}
                                            placeholder="e.g. tourist"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-app focus:outline-none focus:border-brand-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-app ml-1">Password</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-app" />
                                        <input
                                            type="password"
                                            required
                                            value={authPassword}
                                            onChange={(e) => setAuthPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-text-app focus:outline-none focus:border-brand-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {authError && (
                                    <p className="text-red-400 text-xs text-center py-1 font-bold">{authError}</p>
                                )}

                                <Button
                                    variant="primary"
                                    disabled={authLoading}
                                    className="w-full rounded-xl py-3 mt-4"
                                >
                                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Register')}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-xs text-muted-app">
                                {authMode === 'login' ? "Don't have an account? " : "Already claimed? "}
                                <button
                                    type="button"
                                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                    className="text-brand-primary font-bold hover:underline"
                                >
                                    {authMode === 'login' ? 'Register' : 'Sign In'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <Card className="group hover-lift bg-linear-to-br from-card-app to-white/1">
            {/* Icon */}
            <div
                className="p-4 rounded-2xl w-fit mb-6
                            group-hover:scale-110 group-hover:rotate-3 transition-all duration-400"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(157,110,245,0.10) 100%)',
                    boxShadow: '0 4px 16px rgba(79,142,247,0.12)',
                }}
            >
                <Icon
                    size={26}
                    style={{ color: 'var(--color-brand-primary)' }}
                />
            </div>

            <h3
                className="text-xl md:text-2xl font-display font-bold mb-3 tracking-tight group-hover:gradient-text transition-all duration-400"
                style={{ color: 'var(--text-main)' }}
            >
                {title}
            </h3>
            <p
                className="text-sm leading-relaxed font-medium opacity-75 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
            >
                {desc}
            </p>

            {/* Animated accent bar */}
            <div
                className="mt-6 h-0.5 rounded-full transition-all duration-500 group-hover:w-20 w-10"
                style={{
                    background:
                        'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary))',
                }}
            />

            {/* Ghost icon */}
            <div
                className="absolute -right-8 -bottom-8 opacity-[0.025] group-hover:opacity-[0.08]
                            group-hover:scale-125 transition-all duration-700 pointer-events-none rotate-[-15deg]"
            >
                {Icon && <Icon size={160} />}
            </div>
        </Card>
    );
}
