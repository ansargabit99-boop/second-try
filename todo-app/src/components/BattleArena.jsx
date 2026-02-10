import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Swords, Skull, Trophy, ShieldAlert } from 'lucide-react';

const BOSSES = [
    { id: 'PROCRASTINATION', name: 'Swamp of Procrastination', level: 5, recommendedLvl: 3 },
    { id: 'LAZINESS', name: 'Titan of Laziness', level: 10, recommendedLvl: 8 },
    { id: 'DOUBT', name: 'Shadow of Doubt', level: 20, recommendedLvl: 15 }
];

const BattleArena = () => {
    const { player, getFriends, startBattle, playSound, saySystem } = useGame();
    const [mode, setMode] = useState('PVE'); // PVE, PVP
    const [friends, setFriends] = useState([]);
    const [selectedOpponent, setSelectedOpponent] = useState(null); // ID of boss or friend
    const [battleLog, setBattleLog] = useState([]);
    const [battling, setBattling] = useState(false);
    const [result, setResult] = useState(null); // VICTORY, DEFEAT

    useEffect(() => {
        if (mode === 'PVP') {
            getFriends().then(setFriends);
            setSelectedOpponent(null);
        } else {
            setSelectedOpponent(BOSSES[0].id);
        }
    }, [mode]);

    const handleStartBattle = async () => {
        if (!selectedOpponent) return;

        setBattling(true);
        setBattleLog([]);
        setResult(null);
        saySystem("COMBAT MODE INITIATED.");
        playSound('quest_complete'); // Reuse sound or add battle sound

        try {
            const data = await startBattle(selectedOpponent, mode, mode === 'PVE' ? selectedOpponent : null);

            // ANIMATE LOG
            let i = 0;
            const interval = setInterval(() => {
                if (i < data.battle.log.length) {
                    setBattleLog(prev => [...prev, data.battle.log[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                    setResult(data.result);
                    setBattling(false);
                    if (data.result === 'VICTORY') {
                        saySystem("ENEMY ELIMINATED. LEVEL UP IMMINENT.");
                        playSound('level_up');
                    } else {
                        saySystem("CRITICAL DAMAGE SUSTAINED. RETREAT.");
                    }
                }
            }, 800); // 0.8s per turn for dramatic effect

        } catch (err) {
            setBattling(false);
            console.error(err);
        }
    };

    return (
        <section className="bg-solo-bg/50 border border-solo-primary/30 p-6 rounded-lg backdrop-blur-sm relative min-h-[400px]">
            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex justify-between items-center font-orbitron">
                <span>DUNGEON GATE</span>
                <span className="text-[10px] text-gray-500">RATING: {player?.rating || 1000}</span>
            </h2>

            {!battling && !result && (
                <div className="space-y-6 animate-fade-in">
                    {/* MODE SELECT */}
                    <div className="flex bg-black/40 rounded p-1">
                        <button
                            onClick={() => setMode('PVE')}
                            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${mode === 'PVE' ? 'bg-solo-primary text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            BOSS RAIDS
                        </button>
                        <button
                            onClick={() => setMode('PVP')}
                            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${mode === 'PVP' ? 'bg-solo-primary text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            HUNTER DUELS
                        </button>
                    </div>

                    {/* OPPONENT SELECT */}
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Select Target</p>

                        {mode === 'PVE' && (
                            <div className="grid grid-cols-1 gap-2">
                                {BOSSES.map(boss => (
                                    <button
                                        key={boss.id}
                                        onClick={() => setSelectedOpponent(boss.id)}
                                        className={`p-3 border rounded text-left transition-all relative overflow-hidden group
                                            ${selectedOpponent === boss.id
                                                ? 'border-red-500 bg-red-900/20 text-white'
                                                : 'border-gray-800 bg-black/40 text-gray-400 hover:border-red-500/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="font-cinzel font-bold">{boss.name}</span>
                                            <span className="text-[10px] bg-red-900/50 px-2 py-1 rounded text-red-300">LVL {boss.level}</span>
                                        </div>
                                        {player.level < boss.recommendedLvl && (
                                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                                <ShieldAlert size={10} /> DANGER: High Level
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === 'PVP' && (
                            <div className="space-y-2">
                                {friends.length === 0 && <p className="text-gray-500 text-sm italic">Add friends to duel them.</p>}
                                {friends.map(f => (
                                    <button
                                        key={f._id}
                                        onClick={() => setSelectedOpponent(f._id)}
                                        className={`w-full p-3 border rounded text-left transition-all flex justify-between items-center
                                            ${selectedOpponent === f._id
                                                ? 'border-solo-primary bg-solo-primary/10 text-white'
                                                : 'border-gray-800 bg-black/40 text-gray-400 hover:border-solo-primary/50'
                                            }`}
                                    >
                                        <span>{f.name}</span>
                                        <span className="text-xs text-solo-primary">Rating: {f.rating || 1000}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStartBattle}
                        disabled={!selectedOpponent}
                        className="w-full bg-red-600 text-white py-4 rounded font-bold tracking-[0.2em] font-orbitron hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Swords size={20} /> ENTER GATE
                    </button>
                </div>
            )}

            {/* BATTLE LOG */}
            {(battling || result) && (
                <div className="absolute inset-0 z-20 bg-black/90 p-6 flex flex-col">
                    <h3 className="text-center text-red-500 font-orbitron text-xl mb-4 animate-pulse">COMBAT LOG</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs custom-scrollbar">
                        {battleLog.map((line, i) => (
                            <p key={i} className="animate-slide-up text-gray-300 border-l-2 border-red-900 pl-2">
                                {line}
                            </p>
                        ))}
                    </div>

                    {result && (
                        <div className="mt-4 text-center animate-bounce-in">
                            <h2 className={`text-4xl font-orbitron mb-2 ${result === 'VICTORY' ? 'text-solo-primary text-glow' : 'text-red-600'}`}>
                                {result}
                            </h2>
                            <button onClick={() => { setBattling(false); setResult(null); setBattleLog([]); }} className="text-sm underline text-gray-400 hover:text-white">
                                Close Gate
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default BattleArena;
