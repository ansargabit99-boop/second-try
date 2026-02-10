import { GameProvider, useGame } from './context/GameContext'
import StatusWindow from './components/StatusWindow';
import QuestLog from './components/QuestLog';
import CalendarView from './components/CalendarView';
import NutritionPanel from './components/NutritionPanel';
import SocialPanel from './components/SocialPanel';
import BattleArena from './components/BattleArena';
import LevelUpModal from './components/LevelUpModal';
import SystemTalker from './components/SystemTalker';
import StatTestModal from './components/StatTestModal';
import { useState, useEffect } from 'react';

function GameUI() {
  const { player, notifications, loading, logout, saySystem } = useGame();
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    // Show test for new players who haven't calculated IQ yet
    if (player && player.iq === 100 && !localStorage.getItem('hunter_tested')) {
      setShowTest(true);
      localStorage.setItem('hunter_tested', 'true');
    }

    const handleOpenTest = () => setShowTest(true);
    window.addEventListener('open-test', handleOpenTest);

    // Initial System Voice
    saySystem("SYSTEM ONLINE. WELCOME HUNTER.");

    return () => window.removeEventListener('open-test', handleOpenTest);
  }, [player]);

  if (!player) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-solo-bg text-white font-orbitron selection:bg-solo-primary selection:text-black">
      <div className="container mx-auto p-4 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-solo-primary/30 pb-4 gap-4 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-solo-primary drop-shadow-[0_0_10px_rgba(0,234,255,0.5)]">
            SYSTEM
          </h1>
          <div className="flex flex-col sm:items-end">
            <h2 className="text-xl font-bold tracking-widest text-white uppercase">{player.name}</h2>
            <p className="text-[10px] text-solo-primary font-mono tracking-[0.3em] uppercase">{player.title || "Elite Hunter"}</p>
            <button
              onClick={logout}
              className="px-3 py-1 text-xs border border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all rounded mt-2 sm:mt-0"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded border ${n.type === 'danger' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-solo-bg/90 border-solo-primary text-solo-primary'} shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-bounce-in`}>
              {n.message}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>

          {/* Left Column: Status */}
          <div className="space-y-6">
            <StatusWindow />
          </div>

          {/* Middle Column: Calendar & Quests */}
          <div className="space-y-6">
            <CalendarView />
            <QuestLog />
            <SocialPanel />
            <BattleArena />
          </div>

          {/* Right Column: System Logs / Notifications (For balance, or future component) */}
          <div className="space-y-6">
            <NutritionPanel />
          </div>

        </div>

        <LevelUpModal />
        <SystemTalker />
        <StatTestModal isOpen={showTest} onClose={() => setShowTest(false)} />
      </div>

      {/* Background Grid/Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 234, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 234, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}>
      </div>
    </div>
  )
}

import LoginScreen from './components/LoginScreen';

function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  )
}

export default App
