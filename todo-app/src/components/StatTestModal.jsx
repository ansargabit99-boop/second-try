import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Brain, Heart, CheckCircle, ChevronRight, X, Play, RotateCcw } from 'lucide-react';

const StatTestModal = ({ isOpen, onClose }) => {
    const { player, updatePlayer, updatePlayerState, saySystem, playSound, addNotification } = useGame();
    const [step, setStep] = useState(1); // 1: Intro, 2: Metrics, 3: IQ, 4: Fitness, 5: Social, 6: Results
    const [metrics, setMetrics] = useState({ weight: player?.weight || 70, height: player?.height || 175 });
    const [iqScore, setIqScore] = useState(0);
    const [fitnessScore, setFitnessScore] = useState(0);
    const [socialScore, setSocialScore] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            saySystem("ENTERING SYNC CENTER. PREPARE FOR ASSESSMENT.");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const completeAssessment = async () => {
        // Calculate new established stats
        const newIQ = 90 + (iqScore * 10);
        const newFitness = 40 + (fitnessScore * 10);
        const newSocial = 40 + (socialScore * 10);

        // Growth logic
        const updates = {
            weight: metrics.weight,
            height: metrics.height,
            iq: Math.max(player.iq || 100, Math.round((player.iq + newIQ) / 2)),
            fitness: Math.max(player.fitness || 50, (player.fitness || 50) + 1),
            social: Math.max(player.social || 50, (player.social || 50) + 1),
            health: Math.max(player.health || 50, (player.health || 50) + 1),
        };

        // 1. INSTANT UPDATE (No Animation, No Syncing State)
        updatePlayerState(updates);

        // 2. Move directly to results
        setStep(6);
        setSyncing(false); // Ensure this is off

        playSound('level_up');
        saySystem("SYNC COMPLETE. STATUS UPDATED.");
        addNotification("Stats Updated", "system");

        // 3. Background Persistence
        updatePlayer(updates).catch(err => {
            console.error("Background save failed:", err);
        });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in scanline-overlay">
            {/* ... existing modal structure ... */}
            <div className="glass-panel p-8 rounded-lg max-w-lg w-full relative group/modal shadow-[0_0_50px_rgba(0,234,255,0.1)] border border-solo-primary/30 animate-slide-up overflow-hidden">

                {/* Decorative BG Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-solo-primary/5 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-solo-primary transition-colors z-20 p-1 hover:bg-solo-primary/10 rounded"
                    title="ABANDON ASSESSMENT"
                >
                    <X size={20} />
                </button>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-20">
                    <div className="h-full bg-solo-primary shadow-[0_0_10px_#00EAFF] transition-all duration-500 ease-out" style={{ width: `${(step / 6) * 100}%` }} />
                </div>

                {syncing ? (
                    <div className="text-center space-y-6 py-12 flex flex-col items-center justify-center h-[400px] relative">
                        <div className="relative">
                            <Brain size={64} className="text-solo-primary animate-pulse blur-sm absolute inset-0" />
                            <Brain size={64} className="text-solo-primary relative z-10 animate-spin-slow" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-orbitron text-solo-primary tracking-[0.2em] animate-glitch">SYNCHRONIZING</h2>
                            <p className="font-mono text-xs text-gray-400 animate-typing overflow-hidden whitespace-nowrap border-r-2 border-solo-primary pr-1">
                                RECONSTRUCTING HUNTER PARAMETERS...
                            </p>
                        </div>
                        {/* Manual Escape Hatch */}
                        <button
                            onClick={() => { setSyncing(false); setStep(6); }}
                            className="absolute bottom-4 text-[10px] text-gray-600 hover:text-red-400 underline cursor-pointer"
                        >
                            Force Skip
                        </button>
                    </div>
                ) : (
                    <div className="relative z-10 min-h-[400px] flex flex-col justify-center">
                        {step === 1 && (
                            <div className="text-center space-y-8 animate-slide-up">
                                <div className="inline-block p-4 rounded-full bg-solo-primary/10 border border-solo-primary/30 mb-2 relative group">
                                    <Brain size={48} className="text-solo-primary group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 rounded-full border border-solo-primary/50 animate-ping opacity-20" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-orbitron text-white text-glow mb-2">SYNC CENTER</h2>
                                    <div className="h-px w-24 bg-solo-primary/50 mx-auto" />
                                </div>
                                <p className="font-cinzel text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                                    Hunter <span className="text-solo-primary">{player?.name}</span>,<br />
                                    The System requires re-calibration of your capabilities. Initiate protocol to update your status.
                                </p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full bg-solo-primary/10 border border-solo-primary text-solo-primary py-4 rounded hover:bg-solo-primary hover:text-black transition-all duration-300 font-bold tracking-[0.2em] flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_#00EAFF]"
                                >
                                    <Play size={16} /> INITIATE SEQUENCE
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-slide-up">
                                <h2 className="text-xl font-orbitron text-solo-primary border-l-4 border-solo-primary pl-4">PHASE 1: BIOMETRICS</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-solo-primary transition-colors">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={metrics.height}
                                            onChange={(e) => setMetrics({ ...metrics, height: parseInt(e.target.value) })}
                                            className="w-full bg-solo-bg/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary focus:shadow-[0_0_15px_rgba(0,234,255,0.2)] outline-none font-mono text-lg transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-solo-primary transition-colors">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={metrics.weight}
                                            onChange={(e) => setMetrics({ ...metrics, weight: parseInt(e.target.value) })}
                                            className="w-full bg-solo-bg/50 border border-gray-700 rounded px-4 py-3 focus:border-solo-primary focus:shadow-[0_0_15px_rgba(0,234,255,0.2)] outline-none font-mono text-lg transition-all"
                                        />
                                    </div>
                                </div>
                                <button onClick={() => setStep(3)} className="w-full bg-solo-primary/80 text-black py-3 rounded font-bold tracking-widest hover:bg-solo-primary hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                    PROCEED <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {step === 3 && <IQTest onComplete={(s) => { setIqScore(s); setStep(4); }} />}
                        {step === 4 && <FitnessTest onComplete={(s) => { setFitnessScore(s); setStep(5); }} />}
                        {step === 5 && <SocialTest onComplete={(s) => { setSocialScore(s); completeAssessment(); }} />}

                        {step === 6 && (
                            <div className="text-center space-y-8 animate-bounce-in">
                                <div className="relative inline-block">
                                    <CheckCircle size={64} className="text-green-400 mx-auto drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                    <div className="absolute inset-0 animate-ping opacity-20 bg-green-400 rounded-full" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-orbitron text-solo-primary mb-1">SYNC SUCCESSFUL</h2>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Status Updated</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left font-mono">
                                    {[
                                        { label: "IQ", val: player.iq, color: "text-blue-400" },
                                        { label: "FITNESS", val: player.fitness, color: "text-red-400" },
                                        { label: "SOCIAL", val: player.social, color: "text-purple-400" },
                                        { label: "BMI", val: (metrics.weight / ((metrics.height / 100) ** 2)).toFixed(1), color: "text-yellow-400" }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-solo-bg/50 border border-gray-800 rounded hover:border-solo-primary/50 transition-colors group">
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{stat.label}</p>
                                            <p className={`text-2xl ${stat.color} font-bold`}>{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={onClose} className="w-full bg-transparent border border-solo-primary text-solo-primary py-3 rounded font-bold tracking-widest hover:bg-solo-primary hover:text-black transition-all flex items-center justify-center gap-2">
                                    <RotateCcw size={16} /> RETURN TO SYSTEM
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const IQTest = ({ onComplete }) => {
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);

    const questions = [
        { q: "What comes next: 2, 4, 8, 16, ?", a: ["24", "30", "32", "64"], correct: 2 },
        { q: "Which word is the odd one out?", a: ["Circle", "Square", "Triangle", "Blue"], correct: 3 },
        { q: "Complete: 1, 1, 2, 3, 5, ?", a: ["6", "7", "8", "10"], correct: 2 },
        { q: "If A=1, B=2, then C+A = ?", a: ["3", "4", "5", "6"], correct: 1 },
        { q: "Which shape comes next in a sequence of rotation?", a: ["Up", "Right", "Down", "Left"], correct: 3 }
    ];

    const handleAnswer = (idx) => {
        setSelected(idx);
        setTimeout(() => {
            if (idx === questions[qIndex].correct) setScore(score + 1);
            if (qIndex < questions.length - 1) {
                setQIndex(qIndex + 1);
                setSelected(null);
            }
            else onComplete(score + (idx === questions[qIndex].correct ? 1 : 0));
        }, 300);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center text-[10px] text-solo-primary font-orbitron border-b border-gray-800 pb-2">
                <span>MENTAL CAPACITY TEST</span>
                <span>Q {qIndex + 1} / {questions.length}</span>
            </div>
            <h3 className="text-lg font-cinzel text-white leading-relaxed min-h-[60px]">{questions[qIndex].q}</h3>
            <div className="grid grid-cols-1 gap-3">
                {questions[qIndex].a.map((ans, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selected !== null}
                        className={`text-left px-6 py-4 border rounded transition-all font-cinzel text-sm relative overflow-hidden group
                            ${selected === idx
                                ? 'bg-solo-primary text-black border-solo-primary scale-[1.02]'
                                : 'bg-solo-primary/5 border-gray-800 text-gray-300 hover:border-solo-primary hover:bg-solo-primary/10'
                            }`}
                    >
                        <span className="relative z-10">{ans}</span>
                        {selected !== idx && <div className="absolute inset-0 bg-solo-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FitnessTest = ({ onComplete }) => {
    const [pushups, setPushups] = useState(0);

    return (
        <div className="space-y-8 animate-slide-up">
            <h2 className="text-xl font-orbitron text-solo-primary border-l-4 border-solo-primary pl-4">PHASE 3: PHYSICAL TRIAL</h2>
            <div className="p-6 border border-solo-primary/20 bg-solo-primary/5 rounded font-cinzel text-sm text-gray-300 leading-relaxed italic">
                "The System measures your kinetic output. Record your current maximum pushup count to synchronize physical fitness levels."
            </div>
            <div className="space-y-6">
                <div className="flex justify-between text-xs text-gray-500 uppercase">
                    <span>Weak</span>
                    <span>God-Tier</span>
                </div>
                <div className="relative pt-6 pb-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={pushups}
                        onChange={(e) => setPushups(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-solo-primary hover:accent-solo-primary/80 transition-all"
                    />
                    <div
                        className="absolute top-0 left-0 bg-solo-primary text-black text-xs font-bold px-2 py-1 rounded -translate-x-1/2 transition-all"
                        style={{ left: `${pushups}%` }}
                    >
                        {pushups}
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-4xl font-mono text-solo-primary text-glow">{pushups}</span>
                    <span className="text-xs text-gray-500 block mt-1">REPETITIONS</span>
                </div>
            </div>
            <button onClick={() => onComplete(pushups / 20)} className="w-full bg-solo-primary text-black py-4 rounded font-bold tracking-widest hover:shadow-[0_0_20px_#00EAFF] transition-all">
                VERIFY POWER LEVEL
            </button>
        </div>
    );
};

const SocialTest = ({ onComplete }) => {
    const questions = [
        { q: "A fellow hunter is wounded in a dungeon. The boss is 10% HP. You?", a: ["Finish Boss", "Save Hunter", "Run"], correct: 1 },
        { q: "A merchant offers a high-rank item for a suspiciously low price.", a: ["Buy Now", "Inspect for curse", "Report to Association"], correct: 1 }
    ];
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);

    const handleAnswer = (i) => {
        if (i === questions[idx].correct) setScore(score + 1);
        if (idx < questions.length - 1) setIdx(idx + 1);
        else onComplete(score + (i === questions[idx].correct ? 1 : 0));
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <h2 className="text-xl font-orbitron text-solo-primary border-l-4 border-solo-primary pl-4">PHASE 4: SOCIAL RESONANCE</h2>
            <div className="min-h-[100px] flex items-center justify-center p-6 bg-solo-bg/50 border border-t-0 border-gray-800 rounded-b-lg mt-[-1rem] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-solo-primary/50 to-transparent" />
                <p className="text-sm font-cinzel text-white text-center italic">"{questions[idx].q}"</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {questions[idx].a.map((ans, i) => (
                    <button key={i} onClick={() => handleAnswer(i)} className="text-left px-6 py-4 bg-solo-bg/50 border border-gray-800 rounded hover:border-solo-primary hover:scale-[1.01] transition-all text-xs uppercase tracking-wider flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-solo-primary transition-colors" />
                        {ans}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StatTestModal;
