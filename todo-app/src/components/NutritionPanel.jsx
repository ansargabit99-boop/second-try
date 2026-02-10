import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Utensils, Search, X } from 'lucide-react';
import { FOOD_DATABASE } from '../data/foodDatabase';

const NutritionPanel = () => {
    const { player, api, addNotification, updatePlayerState, saySystem } = useGame();
    const [logs, setLogs] = useState([]);
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (player) fetchLogs();
    }, [player]);

    const fetchLogs = async () => {
        try {
            const data = await api.get(`/health/nutrition/${player._id}`);
            setLogs(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (val) => {
        setFoodName(val);
        if (val.length > 1) {
            // Local Suggestions First
            const filtered = Object.keys(FOOD_DATABASE).filter(food =>
                food.toLowerCase().includes(val.toLowerCase())
            );

            setSuggestions(filtered.map(name => ({
                name,
                calories: FOOD_DATABASE[name],
                source: 'local'
            })));

            // Fetch from OpenFoodFacts if query is specific
            if (val.length > 3) {
                try {
                    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(val)}&search_simple=1&action=process&json=1&page_size=5`);
                    const data = await res.json();
                    const apiResults = data.products
                        .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
                        .map(p => ({
                            name: p.product_name,
                            calories: Math.round(p.nutriments['energy-kcal_100g']),
                            source: 'api'
                        }));

                    setSuggestions(prev => [...prev, ...apiResults]);
                } catch (err) {
                    console.error("API Search failed", err);
                }
            }
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectFood = (food) => {
        setFoodName(food.name);
        setCalories(food.calories.toString());
        setShowSuggestions(false);
    };

    const handleAddFood = async (e) => {
        if (e) e.preventDefault();
        const calValue = parseInt(calories);
        if (!foodName || isNaN(calValue)) {
            addNotification("Please enter food name and valid calories", "danger");
            return;
        }

        setLoading(true);
        try {
            const data = await api.post('/health/nutrition', {
                playerId: player._id,
                name: foodName,
                calories: parseInt(calories),
                protein: 0,
                carbs: 0,
                fat: 0
            });

            setLogs([data.log, ...logs]);
            setFoodName('');
            setCalories('');

            // Special logic for Diet Impact
            if (data.reward) {
                addNotification(data.reward.message, 'levelup');
                // The backend normally awards STR/VIT, but we need to update our new stats
                // We'll map them: STR -> Fitness, VIT -> Health
                const translatedStats = {};
                if (data.reward.stats.fitness) translatedStats.fitness = data.reward.stats.fitness;
                if (data.reward.stats.health) translatedStats.health = data.reward.stats.health;
                translatedStats.diet = (player.diet || 50) + 2; // Eating logs improve diet stat

                updatePlayerState(translatedStats);
                saySystem("NUTRITIONAL INTAKE RECORDED. ACCELERATING PHYSICAL STATUS RECONSTRUCTION.");
            } else {
                saySystem(`Item ${foodName} recorded. Caloric intake processed.`);
            }
        } catch (err) {
            console.error(err);
            addNotification(err.message || "Failed to record nutrition log", "danger");
        } finally {
            setLoading(false);
        }
    };

    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
    const targetCalories = 2500;
    const progress = Math.min((totalCalories / targetCalories) * 100, 100);

    return (
        <section className="glass-panel p-6 rounded-lg h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-solo-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex justify-between items-center font-orbitron">
                <span>HUNTER DIET</span>
                <span className="text-[10px] text-gray-500 tracking-[0.2em]">CALORIC LIMIT: {targetCalories}</span>
            </h2>

            <div className="mb-6">
                <div className="flex justify-between text-[11px] mb-1 font-mono tracking-wider">
                    <span className="text-gray-400 uppercase">Energy Absorption</span>
                    <span className={totalCalories > targetCalories ? 'text-red-400' : 'text-solo-primary'}>
                        {totalCalories} / {targetCalories} KCAL
                    </span>
                </div>
                <div className="w-full bg-gray-900/50 rounded-full h-1.5 border border-gray-800">
                    <div
                        className={`h-full rounded-full ${totalCalories > targetCalories ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-solo-primary shadow-[0_0_10px_rgba(0,234,255,0.5)]'} transition-all duration-700 ease-out`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="relative mb-4">
                <form onSubmit={handleAddFood} className="flex flex-col xs:flex-row gap-2">
                    <div className="relative flex-[2]">
                        <input
                            type="text"
                            value={foodName}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => foodName.length > 1 && setShowSuggestions(true)}
                            placeholder="Identify food intake..."
                            className="w-full bg-solo-bg/50 border border-gray-700 rounded px-3 py-2 focus:border-solo-primary focus:outline-none text-xs text-white pl-8 font-cinzel tracking-wider"
                        />
                        <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
                    </div>
                    <div className="flex gap-2 flex-1">
                        <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="Kcal"
                            className="flex-1 bg-solo-bg/50 border border-gray-700 rounded px-3 py-2 focus:border-solo-primary focus:outline-none text-xs text-white font-mono"
                        />
                        <button type="submit" disabled={loading} className="text-white bg-solo-primary/10 hover:bg-solo-primary/30 border border-solo-primary/50 px-3 py-2 rounded transition-all duration-300">
                            <Plus size={16} />
                        </button>
                    </div>
                </form>

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-[110] left-0 right-0 mt-1 bg-solo-bg/95 border border-solo-primary/30 backdrop-blur-xl rounded shadow-2xl overflow-hidden animate-fade-in max-h-[200px] overflow-y-auto custom-scrollbar">
                        {suggestions.map((food, idx) => (
                            <button
                                key={`${food.name}-${idx}`}
                                onClick={() => selectFood(food)}
                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-solo-primary/20 hover:text-solo-primary border-b border-gray-800 last:border-0 transition-colors flex justify-between items-center"
                            >
                                <div className="flex flex-col">
                                    <span className="truncate max-w-[150px]">{food.name}</span>
                                    <span className="text-[8px] opacity-40 uppercase tracking-tighter">{food.source}</span>
                                </div>
                                <span className="text-solo-primary font-mono">{food.calories} kcal</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-[200px]">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 opacity-30">
                        <Utensils size={32} className="mb-2" />
                        <p className="text-[10px] uppercase tracking-[0.2em]">Nutrition Required</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log._id} className="text-[11px] p-2 bg-solo-bg/30 border border-gray-800/50 rounded flex justify-between items-center group/log hover:border-solo-primary/30 transition-all font-cinzel">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-solo-primary rounded-full group-hover/log:scale-150 transition-transform" />
                                <span className="text-gray-200 tracking-wider uppercase">{log.name}</span>
                            </div>
                            <span className="text-solo-primary font-orbitron">{log.calories} kcal</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default NutritionPanel;
