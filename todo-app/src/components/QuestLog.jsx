import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, X, Check } from 'lucide-react';

const QuestLog = () => {
    const { quests, addQuest, completeQuest, removeQuest } = useGame();
    const [newQuestTitle, setNewQuestTitle] = useState('');

    const handleAddQuest = (e) => {
        e.preventDefault();
        if (newQuestTitle.trim()) {
            addQuest(newQuestTitle, 'E'); // Default Easy
            setNewQuestTitle('');
        }
    };

    return (
        <section className="bg-solo-bg/50 border border-solo-primary/30 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex justify-between items-center">
                <span>QUEST LOG</span>
                <span className="text-xs text-gray-500">DAILIES</span>
            </h2>

            <form onSubmit={handleAddQuest} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newQuestTitle}
                    onChange={(e) => setNewQuestTitle(e.target.value)}
                    placeholder="Add new quest..."
                    className="flex-1 bg-solo-bg/50 border border-gray-700 rounded px-3 py-1 focus:border-solo-primary focus:outline-none text-sm"
                />
                <button type="submit" className="text-solo-primary border border-solo-primary px-3 py-1 rounded hover:bg-solo-primary/10 transition-colors text-sm flex items-center gap-1">
                    <Plus size={14} /> ADD
                </button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {quests.length === 0 && (
                    <div className="text-center text-gray-600 italic py-4">No active quests.</div>
                )}
                {quests.map(quest => (
                    <div key={quest._id} className={`p-3 border rounded transition-all duration-300 ${quest.completed ? 'border-green-500/30 bg-green-900/10 opacity-60' : quest.failed ? 'border-red-500/30 bg-red-900/10' : 'border-solo-primary/30 bg-solo-bg/30 hover:border-solo-primary/80'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`${quest.completed ? 'text-green-400 line-through' : quest.failed ? 'text-red-400' : 'text-white'} font-bold`}>
                                {quest.title}
                            </h3>
                            <span className="text-xs text-gray-500 border border-gray-700 rounded px-1">{quest.difficulty}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-blue-300">Reward: {quest.xpReward} XP</span>
                            {!quest.completed && !quest.failed && (
                                <div className="flex gap-2">
                                    <button onClick={() => completeQuest(quest._id)} className="text-xs bg-solo-primary/10 text-solo-primary hover:bg-solo-primary/20 px-2 py-1 rounded border border-solo-primary/30 flex items-center gap-1">
                                        <Check size={12} /> COMPLETE
                                    </button>
                                    <button onClick={() => removeQuest(quest._id)} className="text-xs text-gray-600 hover:text-white">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            {quest.completed && <span className="text-xs text-green-500">COMPLETED</span>}
                            {quest.failed && <span className="text-xs text-red-500">FAILED</span>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default QuestLog;
