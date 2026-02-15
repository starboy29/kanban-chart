import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
} from 'date-fns';

const Calendar = () => {
    const { tasks, calendarSyncEnabled, calendarSyncing } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Memoized tasks mapping for better performance
    const tasksByDay = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            if (!task.date) return;
            const dateStr = task.date.includes('T') ? task.date.split('T')[0] : task.date;
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(task);
        });
        return map;
    }, [tasks]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-blue-500';
            case 'low': return 'bg-emerald-500';
            default: return 'bg-gray-500';
        }
    };

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDayTasks = tasksByDay[selectedDateStr] || [];

    return (
        <div className="h-full flex flex-col md:flex-row p-4 md:p-6 gap-6 overflow-hidden bg-[#141118]">

            {/* Left Column: Calendar Grid */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                <span className="material-symbols-rounded">chevron_left</span>
                            </button>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                <span className="material-symbols-rounded">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {calendarSyncEnabled && (
                            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${calendarSyncing ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${calendarSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                {calendarSyncing ? 'Syncing...' : 'Google Calendar Connected'}
                            </div>
                        )}
                        <button
                            onClick={goToToday}
                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-all hover:text-white"
                        >
                            TODAY
                        </button>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="flex-1 bg-[#1c191f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
                        {weekDays.map(day => (
                            <div key={day} className="py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Cells */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-white/5">
                        {days.map((day, idx) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayTasks = tasksByDay[dateKey] || [];
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isDayToday = isToday(day);
                            const isSelected = format(day, 'yyyy-MM-dd') === selectedDateStr;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        min-h-[80px] p-2 transition-all flex flex-col gap-1.5 relative border-b border-white/5 cursor-pointer group
                                        ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : 'hover:bg-indigo-500/5'}
                                        ${isSelected ? 'bg-indigo-500/10' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`
                                            text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all
                                            ${isDayToday
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                                                : isSelected ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-500 group-hover:text-gray-300'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] text-gray-600 font-bold">{dayTasks.length}</span>
                                        )}
                                    </div>

                                    {/* Task Markers */}
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        {dayTasks.slice(0, 4).map(task => (
                                            <div
                                                key={task.id}
                                                className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority || (task.isUrgent ? 'urgent' : 'medium'))} shadow-sm`}
                                                title={task.title}
                                            />
                                        ))}
                                        {dayTasks.length > 4 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Day Agenda */}
            <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-[#1c191f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-full shadow-2xl">
                    <div className="mb-6">
                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1">Agenda for</p>
                        <h3 className="text-xl font-bold text-white">
                            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'do MMMM')}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                        {selectedDayTasks.length > 0 ? (
                            selectedDayTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/5 ${getPriorityColor(task.priority || (task.isUrgent ? 'urgent' : 'medium')).replace('bg-', 'text-').replace('text-red-500', 'text-red-400')}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                        {task.googleEventId && (
                                            <span className="material-symbols-rounded text-blue-400 text-[14px]">sync</span>
                                        )}
                                    </div>
                                    <h4 className={`text-sm font-semibold text-gray-200 leading-snug group-hover:text-white transition-colors ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                                        {task.title}
                                    </h4>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[9px] font-bold border border-indigo-500/20">
                                            {task.subject}
                                        </span>
                                        {task.status === 'done' && (
                                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                                                <span className="material-symbols-rounded text-[14px]">check_circle</span>
                                                Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                                <span className="material-symbols-rounded text-4xl mb-2 text-gray-500">event_busy</span>
                                <p className="text-sm font-medium">No tasks scheduled for this day</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-[11px] font-medium text-indigo-300/80 mb-2 leading-relaxed">
                                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'} for this date.
                            </p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${selectedDayTasks.length > 0 ? (selectedDayTasks.filter(t => t.status === 'done').length / selectedDayTasks.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
