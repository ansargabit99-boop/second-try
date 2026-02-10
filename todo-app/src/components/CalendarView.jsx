import { useState } from 'react';
import Calendar from 'react-calendar';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const CalendarView = () => {
    const { quests, addQuest } = useGame();
    const [date, setDate] = useState(new Date());
    const [newQuestTitle, setNewQuestTitle] = useState('');

    const onChange = (newDate) => {
        setDate(newDate);
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const hasQuest = quests.some(q => {
                if (!q.dueDate && q.isDaily) {
                    return isSameDay(new Date(), date);
                }
                return q.dueDate && isSameDay(new Date(q.dueDate), date);
            });
            return hasQuest ? <div className="dot mt-1 mx-auto w-1 h-1 bg-solo-primary rounded-full"></div> : null;
        }
    };

    const handleAddQuest = (e) => {
        e.preventDefault();
        if (newQuestTitle.trim()) {
            addQuest(newQuestTitle, 'D', date); // 'D' difficulty default, with date
            setNewQuestTitle('');
        }
    };

    const dailyQuests = quests.filter(q => {
        if (!q.dueDate && q.isDaily) {
            return isSameDay(new Date(), date);
        }
        return q.dueDate && isSameDay(new Date(q.dueDate), date);
    });

    return (
        <section className="bg-solo-bg/50 border border-solo-primary/30 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl text-solo-primary mb-4 border-b border-solo-primary/20 pb-2 flex justify-between items-center">
                <span>MISSION SCHEDULE</span>
                <span className="text-xs text-gray-500">{date.toDateString()}</span>
            </h2>

            <div className="calendar-container mb-6">
                <Calendar
                    onChange={onChange}
                    value={date}
                    className="bg-transparent border-none text-white w-full font-orbitron"
                    tileContent={tileContent}
                    prevLabel={<ChevronLeft size={16} className="text-solo-primary" />}
                    nextLabel={<ChevronRight size={16} className="text-solo-primary" />}
                    navigationLabel={({ label }) => <span className="text-solo-primary font-bold">{label}</span>}
                />
            </div>

            <div className="space-y-3">
                <h3 className="text-sm text-gray-400 border-b border-gray-700 pb-1 mb-2">MISSIONS FOR {date.toLocaleDateString()}</h3>

                {dailyQuests.length === 0 ? (
                    <p className="text-xs text-gray-600 italic text-center">No missions scheduled.</p>
                ) : (
                    dailyQuests.map(q => (
                        <div key={q._id} className="text-sm p-2 bg-solo-bg/30 border border-gray-700 rounded flex justify-between">
                            <span className={q.completed ? 'line-through text-gray-500' : 'text-white'}>{q.title}</span>
                            <span className="text-xs text-solo-primary">{q.completed ? 'DONE' : 'PENDING'}</span>
                        </div>
                    ))
                )}

                <form onSubmit={handleAddQuest} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={newQuestTitle}
                        onChange={(e) => setNewQuestTitle(e.target.value)}
                        placeholder="Schedule mission..."
                        className="flex-1 bg-solo-bg/50 border border-gray-700 rounded px-3 py-1 focus:border-solo-primary focus:outline-none text-sm text-white"
                    />
                    <button type="submit" className="text-white bg-solo-primary/20 hover:bg-solo-primary/40 border border-solo-primary px-3 py-1 rounded transition-colors text-sm">
                        <Plus size={14} />
                    </button>
                </form>
            </div>

            <style>{`
                .react-calendar { 
                    background: transparent; 
                    border: none; 
                    font-family: inherit;
                    width: 100%;
                }
                .react-calendar__tile {
                    color: white;
                    padding: 10px;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background-color: rgba(0, 234, 255, 0.1);
                    color: #00EAFF;
                }
                .react-calendar__tile--now {
                    background: rgba(255, 255, 255, 0.1);
                }
                .react-calendar__tile--active {
                    background: #00EAFF !important;
                    color: black !important;
                }
                .react-calendar__month-view__days__day--weekend {
                    color: #FF003C;
                }
                .react-calendar__navigation button:disabled {
                    background-color: transparent;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: rgba(0, 234, 255, 0.1);
                }
            `}</style>
        </section>
    );
};

export default CalendarView;
