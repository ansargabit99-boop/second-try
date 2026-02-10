import { useGame } from '../context/GameContext';
import { useEffect } from 'react';

const LevelUpModal = () => {
    const { showLevelUp, closeLevelUp, player } = useGame();

    if (!showLevelUp) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeLevelUp}>
            <div className="bg-solo-bg border-2 border-solo-primary p-8 rounded-lg shadow-[0_0_50px_rgba(0,234,255,0.3)] max-w-sm w-full relative overflow-hidden transform animate-bounce-in" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-solo-primary shadow-[0_0_10px_#00EAFF]"></div>

                <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                    LEVEL UP!
                </h2>

                <div className="text-center mb-6">
                    <p className="text-gray-400 text-sm mb-1">CURRENT LEVEL</p>
                    <p className="text-5xl font-bold text-white text-glow">{player.level}</p>
                </div>

                <div className="space-y-2 border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">MAX HP</span>
                        <span className="text-green-400">INCREASED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">MAX MP</span>
                        <span className="text-blue-400">INCREASED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">STATUS POINTS</span>
                        <span className="text-yellow-400">+5</span>
                    </div>
                </div>

                <button
                    onClick={closeLevelUp}
                    className="w-full mt-6 bg-solo-primary/20 hover:bg-solo-primary/40 text-solo-primary border border-solo-primary py-2 rounded transition-colors uppercase font-bold tracking-wider"
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
