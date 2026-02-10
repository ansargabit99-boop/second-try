import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Lock, Mail, User, ChevronRight, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

const LoginScreen = () => {
    const { login, register, sendVerificationCode, verifyEmailCode, addNotification, notifications, playSound } = useGame();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password/Name (Register)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAction = async (actionFn) => {
        setLoading(true);
        setError('');
        try {
            await actionFn();
            playSound('quest_complete');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Action Failed');
            addNotification(err.message || 'Action Failed', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        handleAction(() => login(name, password));
    };

    const handleSendCode = (e) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError("Invalid Email Protocol");
            return;
        }
        handleAction(async () => {
            await sendVerificationCode(email);
            setStep(2);
        });
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        handleAction(async () => {
            const token = await verifyEmailCode(email, verificationCode);
            setVerificationToken(token);
            setStep(3);
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        handleAction(() => register(email, name, password, verificationToken));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white font-orbitron relative overflow-hidden selection:bg-solo-primary selection:text-black">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-solo-primary to-transparent opacity-50 animate-pulse" />

            {/* Error Notification Overlay (Duplicate of App but necessary if App unmounts it, though context should handle global notifications, visual redundancy helpful here) */}
            <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded border ${n.type === 'danger' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-solo-bg/90 border-solo-primary text-solo-primary'} shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-bounce-in`}>
                        {n.message}
                    </div>
                ))}
            </div>

            <div className="z-10 p-6 md:p-10 rounded-xl border border-solo-primary/30 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,234,255,0.1)] w-full max-w-md animate-slide-up relative group">

                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-solo-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-solo-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-solo-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-solo-primary" />

                <h1 className="text-4xl font-bold text-center text-solo-primary mb-2 tracking-[0.2em] text-glow animate-pulse">
                    SYSTEM ACCESS
                </h1>
                <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">
                    {isLogin ? "Identify Yourself, Hunter" : "Initiate Awakening Sequence"}
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-3 text-red-400 text-xs animate-shake">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* LOGIN FORM */}
                {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 group/input">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center gap-2">
                                <User size={12} /> Hunter Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary focus:shadow-[0_0_15px_rgba(0,234,255,0.2)] outline-none transition-all font-mono"
                                placeholder="Enter your designation"
                            />
                        </div>
                        <div className="space-y-2 group/input">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center gap-2">
                                <Lock size={12} /> Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary focus:shadow-[0_0_15px_rgba(0,234,255,0.2)] outline-none transition-all font-mono"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-solo-primary text-black py-4 rounded font-bold tracking-[0.2em] hover:shadow-[0_0_20px_#00EAFF] transition-all duration-300 relative group/btn overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <span className="animate-pulse">AUTHENTICATING...</span> : (
                                <span className="flex items-center justify-center gap-2">
                                    ACCESS SYSTEM <ChevronRight size={16} />
                                </span>
                            )}
                        </button>
                    </form>
                ) : (
                    /* REGISTER FLOW */
                    <div className="space-y-6">
                        {/* Progress Steps */}
                        <div className="flex justify-between mb-8 px-4">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500 ${step >= s ? 'bg-solo-primary text-black border-solo-primary shadow-[0_0_10px_#00EAFF]' : 'bg-black text-gray-600 border-gray-800'}`}>
                                        {step > s ? <CheckCircle size={14} /> : s}
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-wider ${step >= s ? 'text-solo-primary' : 'text-gray-700'}`}>
                                        {s === 1 ? 'EMAIL' : s === 2 ? 'VERIFY' : 'CREATE'}
                                    </span>
                                </div>
                            ))}
                            <div className="absolute top-[165px] left-14 right-14 h-[1px] bg-gray-800 -z-10" />
                        </div>

                        {/* STEP 1: EMAIL */}
                        {step === 1 && (
                            <form onSubmit={handleSendCode} className="space-y-6 animate-slide-up">
                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center gap-2">
                                        <Mail size={12} /> Email Protocol
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary outline-none transition-all font-mono"
                                        placeholder="hunter@system.com"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-solo-primary/20 border border-solo-primary text-solo-primary py-3 rounded hover:bg-solo-primary hover:text-black transition-all text-xs font-bold tracking-widest">
                                    {loading ? 'TRANSMITTING...' : 'SEND VERIFICATION CODE'}
                                </button>
                            </form>
                        )}

                        {/* STEP 2: VERIFY CODE */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyCode} className="space-y-6 animate-slide-up">
                                <div className="space-y-2 group/input text-center">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center justify-center gap-2">
                                        <Smartphone size={12} /> Enter 6-Digit Code
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                                        className="w-full bg-black/50 border border-gray-700 rounded px-4 py-4 focus:border-solo-primary outline-none transition-all font-mono text-center text-2xl tracking-[0.5em]"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-solo-primary/20 border border-solo-primary text-solo-primary py-3 rounded hover:bg-solo-primary hover:text-black transition-all text-xs font-bold tracking-widest">
                                    {loading ? 'VERIFYING...' : 'CONFIRM CODE'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] text-gray-500 hover:text-white">Resend Code</button>
                            </form>
                        )}

                        {/* STEP 3: REGISTER */}
                        {step === 3 && (
                            <form onSubmit={handleRegister} className="space-y-6 animate-slide-up">
                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center gap-2">
                                        <User size={12} /> Assign Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary outline-none transition-all font-mono"
                                        placeholder="Hunter Name"
                                    />
                                </div>
                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest group-hover/input:text-solo-primary transition-colors flex items-center gap-2">
                                        <Lock size={12} /> Set Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary outline-none transition-all font-mono"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-solo-primary text-black py-4 rounded font-bold tracking-[0.2em] hover:shadow-[0_0_20px_#00EAFF] transition-all animate-pulse-slow">
                                    {loading ? 'AWAKENING...' : 'CONFIRM AWAKENING'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* FOOTER SWITCH */}
                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); }}
                        className="text-[10px] text-gray-500 hover:text-solo-primary transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLogin ? (
                            <>Initialize Awakening Protocol <ChevronRight size={12} /></>
                        ) : (
                            <><ChevronRight size={12} className="rotate-180" /> Return to Login</>
                        )}
                    </button>
                </div>
            </div>

            {/* Version Tag */}
            <div className="absolute bottom-4 right-4 text-[10px] text-gray-700 font-mono">
                SYSTEM VER 4.0 // CONNECTED
            </div>
        </div>
    );
};

export default LoginScreen;
