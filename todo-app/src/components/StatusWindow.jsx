import { useGame } from '../context/GameContext';

const StatusWindow = () => {
    const { player, isListening, allocateStat } = useGame();

    // Calculate percentages for bars
    const hpPercent = (player.hp / player.maxHp) * 100;
    const xpPercent = (player.xp / player.xpToNextLevel) * 100;

    return (
        <section className="bg-solo-bg/50 border border-solo-primary/30 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-solo-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                <span>STATUS</span>
                <div className="flex items-center gap-4">
                    {isListening && <span className="text-[10px] text-green-400 animate-pulse font-mono tracking-tighter">● VOICE ACTIVE</span>}
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-test'))}
                        className="text-[10px] bg-solo-primary/20 hover:bg-solo-primary text-solo-primary hover:text-black border border-solo-primary/50 px-2 py-0.5 rounded transition-all font-bold tracking-widest"
                    >
                        RE-SYNC
                    </button>
                </div>
            </h2>
            <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs tracking-widest">HUNTER RANK</span>
                    <span className="text-3xl text-solo-primary font-bold drop-shadow-[0_0_8px_rgba(0,234,255,0.4)]">
                        {player.rank || 'E'}
                    </span>
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 gap-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>WGT: <span className="text-solo-primary">{player.weight || 70}kg</span></span>
                        <span>HGT: <span className="text-solo-primary">{player.height || 175}cm</span></span>
                    </div>
                    <span>LEVEL <span className="text-yellow-400 text-lg">{player.level}</span></span>
                </div>

                {/* HP Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] tracking-tighter">
                        <span className="text-solo-danger">VITALITY STATUS</span>
                        <span>{player.hp} / {player.maxHp}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-solo-danger transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,50,50,0.5)]"
                            style={{ width: `${hpPercent}%` }}
                        />
                    </div>
                </div>

                {/* XP Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] tracking-tighter">
                        <span className="text-blue-400">SYSTEM SYNC</span>
                        <span>{Math.round(xpPercent)}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-400 transition-all duration-500 ease-out shadow-[0_0_5px_rgba(0,100,255,0.5)]"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                </div>

                {/* STATS Section */}
                <div className="pt-4 border-t border-solo-primary/20 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-solo-primary text-xs font-bold tracking-widest">HUNTER ABILITIES</span>
                        {player.statPoints > 0 && (
                            <span className="text-[10px] bg-yellow-400 text-black px-1 rounded animate-pulse font-bold">
                                {player.statPoints} AP
                            </span>
                        )}
                    </div>

                    {[
                        { key: 'health', label: 'HEALTH' },
                        { key: 'diet', label: 'DIET' },
                        { key: 'iq', label: 'IQ' },
                        { key: 'fitness', label: 'FITNESS' },
                        { key: 'social', label: 'SOCIAL' }
                    ].map(stat => (
                        <div key={stat.key} className="flex justify-between items-center group/stat py-1">
                            <span className="text-gray-400 text-[11px] tracking-wider">{stat.label}</span>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${player[stat.key] > 80 ? 'text-green-400' : 'text-white'}`}>
                                    {player[stat.key] || 50}
                                </span>
                                {player.statPoints > 0 && (
                                    <button
                                        onClick={() => allocateStat(stat.key)}
                                        className="w-4 h-4 flex items-center justify-center bg-solo-primary/10 border border-solo-primary/30 text-solo-primary rounded hover:bg-solo-primary hover:text-black transition-all text-xs"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatusWindow;
