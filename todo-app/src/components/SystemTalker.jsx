import { useGame } from '../context/GameContext';
import { Bot, AlertTriangle, Zap } from 'lucide-react';

const SystemTalker = () => {
    const { systemChat } = useGame();

    if (!systemChat.visible) return null;

    const getIcon = () => {
        switch (systemChat.type) {
            case 'danger': return <AlertTriangle className="text-red-500 animate-pulse" />;
            case 'levelup': return <Zap className="text-yellow-400 animate-bounce" />;
            default: return <Bot className="text-solo-primary shadow-[0_0_10px_rgba(0,234,255,0.5)]" />;
        }
    };

    const getBorderColor = () => {
        switch (systemChat.type) {
            case 'danger': return 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
            case 'levelup': return 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]';
            default: return 'border-solo-primary/50 shadow-[0_0_20px_rgba(0,234,255,0.2)]';
        }
    };

    return (
        <div className={`fixed bottom-10 right-10 z-[100] max-w-sm w-full animate-slide-up`}>
            <div className={`bg-solo-bg/90 backdrop-blur-xl border-t-2 ${getBorderColor()} p-4 rounded-lg flex gap-4 items-start relative overflow-hidden`}>
                {/* Glitch Overlay */}
                <div className="absolute inset-0 bg-solo-primary/5 opacity-10 pointer-events-none animate-pulse" />

                <div className="bg-solo-bg p-2 rounded border border-gray-800 relative z-10">
                    {getIcon()}
                </div>

                <div className="flex-1 relative z-10">
                    <p className="text-[10px] text-solo-primary font-orbitron tracking-[0.2em] mb-1 opacity-70">
                        SYSTEM INTERFACE
                    </p>
                    <div className="text-sm font-cinzel text-gray-100 leading-relaxed font-medium">
                        <span className="inline-block animate-typing overflow-hidden whitespace-normal border-r-2 border-solo-primary pr-1">
                            {systemChat.message}
                        </span>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-1">
                    <div className="w-1 h-1 bg-solo-primary/30 rounded-full mb-1" />
                    <div className="w-1 h-1 bg-solo-primary/30 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default SystemTalker;
