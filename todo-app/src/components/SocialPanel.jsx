import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Users, UserPlus, Search, Shield, MessageSquare } from 'lucide-react';

const SocialPanel = () => {
    const { player, searchPlayers, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest } = useGame();
    const [activeTab, setActiveTab] = useState('friends'); // friends, search, requests
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (activeTab === 'friends') loadFriends();
        if (activeTab === 'requests') loadRequests();
    }, [activeTab]);

    const loadFriends = async () => {
        const data = await getFriends();
        setFriends(data);
    };

    const loadRequests = async () => {
        const data = await getFriendRequests();
        setRequests(data);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        const results = await searchPlayers(query);
        setSearchResults(results.filter(p => p._id !== player._id)); // Exclude self
    };

    const handleAddFriend = async (id) => {
        const success = await sendFriendRequest(id);
        if (success) {
            setSearchResults(prev => prev.filter(p => p._id !== id));
        }
    };

    const handleAccept = async (req) => {
        const success = await acceptFriendRequest(req._id, req.requester.name);
        if (success) loadRequests();
    };

    return (
        <section className="bg-solo-bg/50 border border-solo-primary/30 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex justify-between items-center font-orbitron">
                <span>HUNTER NETWORK</span>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('friends')} className={`p-1 rounded ${activeTab === 'friends' ? 'bg-solo-primary/20 text-white' : 'text-gray-500 hover:text-solo-primary'}`} title="Friends"><Users size={16} /></button>
                    <button onClick={() => setActiveTab('search')} className={`p-1 rounded ${activeTab === 'search' ? 'bg-solo-primary/20 text-white' : 'text-gray-500 hover:text-solo-primary'}`} title="Search"><Search size={16} /></button>
                    <button onClick={() => setActiveTab('requests')} className={`p-1 rounded ${activeTab === 'requests' ? 'bg-solo-primary/20 text-white' : 'text-gray-500 hover:text-solo-primary'}`} title="Requests">
                        <div className="relative">
                            <UserPlus size={16} />
                            {requests.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                        </div>
                    </button>
                </div>
            </h2>

            {/* TAB CONTENT */}
            <div className="min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">

                {activeTab === 'friends' && (
                    <div className="space-y-2">
                        {friends.length === 0 && <p className="text-gray-500 text-xs text-center py-4">No connections established.</p>}
                        {friends.map(f => (
                            <div key={f._id} className="bg-black/40 border border-gray-700 p-3 rounded flex justify-between items-center hover:border-solo-primary/50 transition-colors">
                                <div>
                                    <p className="font-bold text-sm text-white">{f.name}</p>
                                    <p className="text-[10px] text-solo-primary">LVL {f.level} • {f.title || 'No Title'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">RANK</p>
                                    <p className="font-bold text-solo-primary">{f.rank}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text" placeHolder="Find Hunter..."
                                value={query} onChange={e => setQuery(e.target.value)}
                                className="flex-1 bg-black/60 border border-gray-700 rounded px-2 py-1 text-sm focus:border-solo-primary outline-none"
                            />
                            <button type="submit" className="bg-solo-primary/10 border border-solo-primary text-solo-primary px-3 rounded text-xs hover:bg-solo-primary hover:text-black transition-colors">SCAN</button>
                        </form>
                        <div className="space-y-2">
                            {searchResults.map(p => (
                                <div key={p._id} className="bg-black/40 border border-gray-700 p-2 rounded flex justify-between items-center">
                                    <span className="text-sm">{p.name} <span className="text-gray-500 text-xs">(Lvl {p.level})</span></span>
                                    <button onClick={() => handleAddFriend(p._id)} className="text-xs text-solo-primary hover:underline border border-solo-primary/30 px-2 py-1 rounded">+ ADD</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-2">
                        {requests.length === 0 && <p className="text-gray-500 text-xs text-center py-4">No pending requests.</p>}
                        {requests.map(req => (
                            <div key={req._id} className="bg-black/40 border border-gray-700 p-3 rounded flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400">Incoming request from:</p>
                                    <p className="font-bold text-sm text-white">{req.requester.name}</p>
                                </div>
                                <button onClick={() => handleAccept(req)} className="bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded text-xs hover:bg-green-500/30">
                                    ACCEPT
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
};

export default SocialPanel;
