import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    // --- STATE ---
    const [player, setPlayer] = useState(() => {
        // Try to restore player from localStorage on initial load
        const savedPlayer = localStorage.getItem('soloLevelingPlayer');
        return savedPlayer ? JSON.parse(savedPlayer) : null;
    });
    const [quests, setQuests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [systemChat, setSystemChat] = useState({
        visible: false,
        message: '',
        type: 'normal' // 'normal', 'danger', 'levelup'
    });
    const [loading, setLoading] = useState(false);

    // --- API HELPERS ---
    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    const api = {
        get: async (endpoint) => {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) throw new Error('API Error');
            return res.json();
        },
        post: async (endpoint, body) => {
            console.log(`API POST [${endpoint}]:`, body);
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            console.log(`API POST [${endpoint}] Status:`, res.status);
            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                if (contentType && contentType.includes('application/json')) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'API Error');
                } else {
                    throw new Error(`Server Error: ${res.status} ${res.statusText}`);
                }
            }

            if (contentType && contentType.includes('application/json')) {
                return res.json();
            }
            return { message: 'Success' };
        },
        put: async (endpoint, body) => {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('API Error');
            return res.json();
        },
        delete: async (endpoint) => {
            const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('API Error');
            return res.json();
        }
    };

    // --- VOICE SYSTEM ---
    // --- SYSTEM CHAT (NEW) ---
    const saySystem = (message, type = 'normal') => {
        setSystemChat({ visible: true, message, type });
        speak(message);
        // Hide after 5 seconds
        setTimeout(() => {
            setSystemChat(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const speak = async (text) => {
        try {
            const data = await api.post('/openai/speak', { text });
            if (data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                audio.play();
            }
        } catch (err) {
            console.warn('OpenAI TTS failed. Audio suppressed by user preference (no robotic fallback).', err);
            // Fallback removed as per user request to avoid robotic voices.
        }
    };

    const chatWithSystem = async (message) => {
        try {
            const context = {
                level: player?.level,
                rank: player?.rank,
                job: player?.job,
                health: player?.hp / player?.maxHp
            };
            const data = await api.post('/openai/chat', { message, context });
            return data.reply;
        } catch (err) {
            console.error('System Chat Error:', err);
            return "SYSTEM ERROR: CONNECTION LOST.";
        }
    };

    const playSound = (type) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'level_up') {
            // Arpeggio for Level Up
            const now = audioCtx.currentTime;
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(261.63, now); // C4
            oscillator.frequency.exponentialRampToValueAtTime(329.63, now + 0.1); // E4
            oscillator.frequency.exponentialRampToValueAtTime(392.00, now + 0.2); // G4
            oscillator.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            oscillator.start();
            oscillator.stop(now + 0.5);
        } else if (type === 'quest_complete') {
            // Double beep for Quest Complete
            const now = audioCtx.currentTime;
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now); // A5
            oscillator.frequency.setValueAtTime(1108.73, now + 0.1); // C#6

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            oscillator.start();
            oscillator.stop(now + 0.3);
        }
    };

    // Persist player to localStorage whenever it changes
    useEffect(() => {
        if (player) {
            localStorage.setItem('soloLevelingPlayer', JSON.stringify(player));
        } else {
            localStorage.removeItem('soloLevelingPlayer');
        }
    }, [player]);

    // Load quests when player is restored from localStorage
    useEffect(() => {
        const loadQuests = async () => {
            if (player && quests.length === 0) {
                try {
                    const questsData = await api.get(`/quests/${player._id}`);
                    setQuests(questsData);
                } catch (err) {
                    console.error('Failed to load quests:', err);
                }
            }
        };
        loadQuests();
    }, [player]);

    useEffect(() => {
        // Simple Voice Command Listener
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript.trim().toLowerCase();
                console.log('Voice Command:', command);

                if (command.includes('system status')) {
                    speak('Opening status window.');
                    // Visual feedback could be added here
                } else if (command.includes('system scan')) {
                    speak('Scanning for daily quests.');
                }
            };

            recognition.start();
            setIsListening(true);

            return () => recognition.stop();
        }
    }, []);

    // --- ACTIONS ---

    const addNotification = (message, type = 'system') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Voice feedback for important events
        if (type === 'levelup') speak('Level up!');
        if (type === 'danger') speak('Warning! Health critical.');

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const closeLevelUp = () => setShowLevelUp(false);

    const login = async (name, password) => {
        setLoading(true);
        try {
            const playerData = await api.post('/auth/login', { name, password });
            setPlayer(playerData);

            const questsData = await api.get(`/quests/${playerData._id}`);
            setQuests(questsData);

            addNotification(`Welcome back, Hunter ${playerData.name}`);
            saySystem(`Welcome back, Hunter ${playerData.name}. Synchronizing HUNTER data... complete.`);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationCode = async (email) => {
        try {
            await api.post('/auth/send-verification', { email });
            addNotification('Verification code sent');
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const verifyEmailCode = async (email, code) => {
        try {
            const response = await api.post('/auth/verify-email', { email, code });
            addNotification('Email verified');
            return response.verificationToken;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const register = async (email, name, password, verificationToken) => {
        setLoading(true);
        try {
            const playerData = await api.post('/auth/register', {
                email,
                name,
                password,
                verificationToken
            });
            setPlayer(playerData);
            setQuests([]);
            addNotification(`Welcome, Hunter ${playerData.name}`);
            saySystem(`Awakening sequence initiated. Welcome to the System, Hunter ${playerData.name}.`);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePlayer = async (updates) => {
        if (!player) return;
        try {
            const updated = await api.put(`/player/${player._id}`, updates);
            setPlayer(updated);
            return updated;
        } catch (err) {
            console.error(err);
            throw err; // Rethrow to let components handle it
        }
    };

    const updatePlayerState = (updates) => {
        setPlayer(prev => ({ ...prev, ...updates }));
    };

    const levelUp = async (currentXp, currentLevel, currentPlayer) => {
        const TITLES = [
            "The One Who Found a Way",
            "Determined Runner",
            "System Reconstructor",
            "E-Rank Survivor",
            "Health Enthusiast",
            "Logic Master"
        ];
        const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)];

        const nextLevel = currentLevel + 1;
        const newMaxHp = 100 + (nextLevel * 10);
        const newMaxMp = 10 + (nextLevel * 2);

        const updates = {
            level: nextLevel,
            xp: currentXp,
            xpToNextLevel: nextLevel * 100,
            hp: newMaxHp,
            maxHp: newMaxHp,
            maxMp: newMaxMp,
            mp: newMaxMp,
            statPoints: (player.statPoints || 0) + 5,
            rank: nextLevel > 10 ? 'C' : nextLevel > 5 ? 'D' : 'E'
        };

        if (nextLevel % 3 === 0) {
            updates.title = randomTitle;
            saySystem(`NEW TITLE EARNED: [${randomTitle}]`);
        }

        setPlayer(prev => ({ ...prev, ...updates }));
        setShowLevelUp(true);
        playSound('level_up');
        addNotification(`LEVEL UP! You are now level ${nextLevel}`, 'levelup');
        saySystem(`LEVEL UP! You have attained level ${nextLevel}. Rank ${updates.rank} stabilization complete.`);

        await updatePlayer(updates);
    };

    const gainXp = async (amount) => {
        if (!player) return;
        let newXp = player.xp + amount;
        let currentLevel = player.level;
        let requiredXp = player.xpToNextLevel;

        if (newXp >= requiredXp) {
            const remainingXp = newXp - requiredXp;
            await levelUp(remainingXp, currentLevel, player);
        } else {
            setPlayer(prev => ({ ...prev, xp: newXp }));
            await updatePlayer({ xp: newXp });
        }
    };

    const addQuest = async (title, difficulty = 'E', date = null) => {
        if (!player) return;
        const xpReward = difficulty === 'E' ? 10 : difficulty === 'D' ? 20 : 50;

        try {
            const newQuest = await api.post('/quests', {
                playerId: player._id,
                title,
                difficulty,
                xpReward,
                isDaily: true,
                dueDate: date
            });
            setQuests(prev => [...prev, newQuest]);
            speak('New quest assigned.');
        } catch (err) {
            addNotification('Failed to add quest', 'danger');
        }
    };

    const completeQuest = async (id) => {
        const quest = quests.find(q => q._id === id);
        if (!quest || quest.completed) return;

        // Optimistic UI update
        setQuests(prev => prev.map(q => q._id === id ? { ...q, completed: true } : q));
        playSound('quest_complete');
        addNotification(`Quest Completed: ${quest.title} (+${quest.xpReward} XP)`);
        speak('Quest complete.');

        try {
            await api.put(`/quests/${id}`, { completed: true });
            await gainXp(quest.xpReward);
        } catch (err) {
            // Revert on failure
            setQuests(prev => prev.map(q => q._id === id ? { ...q, completed: false } : q));
            addNotification('Sync Error', 'danger');
        }
    };

    const failQuest = async (id) => {
        const quest = quests.find(q => q._id === id);
        if (!quest || quest.failed || quest.completed) return;

        setQuests(prev => prev.map(q => q._id === id ? { ...q, failed: true } : q));
        const damage = 20;

        // Take Damage Logic
        const newHp = Math.max(0, player.hp - damage);
        setPlayer(prev => ({ ...prev, hp: newHp }));
        if (newHp === 0) addNotification('CRITICAL HEALTH!', 'danger');
        else addNotification(`Took ${damage} damage!`, 'danger');

        try {
            await api.put(`/quests/${id}`, { failed: true });
            await updatePlayer({ hp: newHp });
        } catch (err) {
            console.error(err);
        }
    };

    const removeQuest = async (id) => {
        setQuests(prev => prev.filter(q => q._id !== id));
        try {
            await api.delete(`/quests/${id}`);
        } catch (err) {
            addNotification('Failed to delete quest', 'danger');
        }
    };

    const allocateStat = async (statName) => {
        if (!player || player.statPoints <= 0) return;

        const updates = {
            [statName]: (player[statName] || 10) + 1,
            statPoints: player.statPoints - 1
        };

        // Optimistic update
        setPlayer(prev => ({ ...prev, ...updates }));

        try {
            await updatePlayer(updates);
            speak(`${statName.toUpperCase()} increased.`);
        } catch (err) {
            console.error(err);
        }
    };

    // --- SOCIAL & BATTLE ACTIONS ---
    const searchPlayers = async (name) => {
        try {
            return await api.get(`/social/search/${name}`);
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const getFriends = async () => {
        if (!player) return [];
        try {
            return await api.get(`/social/friends/${player._id}`);
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const getFriendRequests = async () => {
        if (!player) return [];
        try {
            return await api.get(`/social/requests/${player._id}`);
        } catch (err) {
            return [];
        }
    };

    const sendFriendRequest = async (recipientId) => {
        try {
            const res = await api.post('/social/request', { requesterId: player._id, recipientId });
            addNotification(res.message || "Request Sent");
            saySystem("Friend request transmitted.");
            return true;
        } catch (err) {
            addNotification(err.message, 'danger');
            return false;
        }
    };

    const acceptFriendRequest = async (friendshipId, requesterName) => {
        try {
            await api.post('/social/accept', { friendshipId });
            addNotification(`You are now friends with ${requesterName}`);
            saySystem(`Social connection established with Hunter ${requesterName}.`);
            return true;
        } catch (err) {
            addNotification("Failed to accept", 'danger');
            return false;
        }
    };

    const startBattle = async (targetId, type, bossId = null) => {
        try {
            const data = await api.post('/battle/start', {
                challengerId: player._id,
                targetId,
                type,
                bossId
            });
            // Refresh player stats after battle (hp, xp, rating might change)
            const updatedPlayer = await api.get(`/player/${player.name}`);
            setPlayer(updatedPlayer);
            return data;
        } catch (err) {
            addNotification(err.message, 'danger');
            throw err;
        }
    };

    const logout = () => {
        setPlayer(null);
        setQuests([]);
        localStorage.removeItem('soloLevelingPlayer');
        addNotification('Logged out successfully');
    };

    return (
        <GameContext.Provider value={{
            player,
            quests,
            notifications,
            showLevelUp,
            closeLevelUp,
            login,
            register,
            logout,
            loading,
            sendVerificationCode,
            verifyEmailCode,
            addQuest,
            completeQuest,
            failQuest,
            removeQuest,
            allocateStat,
            updatePlayerState,
            isListening,
            systemChat,
            saySystem,
            chatWithSystem,
            playSound,
            api,
            // Social
            searchPlayers,
            getFriends,
            getFriendRequests,
            sendFriendRequest,
            acceptFriendRequest,
            startBattle
        }}>
            {children}
        </GameContext.Provider>
    );
};
