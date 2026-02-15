import React, { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';

const Calendar = () => {
    const { tasks, calendarSyncEnabled, calendarSyncing, syncAllToCalendar } = useTasks();
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

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper to get tasks for a specific day
    const getTasksForDay = (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return tasks.filter(task => {
            if (!task.date) return false;
            // Handle both ISO strings and YYYY-MM-DD strings
            const taskDate = task.date.includes('T') ? task.date.split('T')[0] : task.date;
            return taskDate === dayStr;
        });
    };

    return (
        <div className="h-full flex flex-col p-3 md:p-6 text-white bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">

            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <h2 className="text-lg md:text-2xl font-bold capitalize">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-1 bg-[#27272a] rounded-lg p-1 border border-white/10">
                        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
                            <span className="material-symbols-rounded">chevron_left</span>
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
                            <span className="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Google Calendar Sync Status */}
                    {calendarSyncEnabled && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] border border-white/10 rounded-xl text-sm">
                            {calendarSyncing ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                    <span className="text-yellow-300 text-xs">Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-emerald-300 text-xs">Google Calendar synced</span>
                                </>
                            )}
                        </div>
                    )}

                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] border border-white/10 rounded-xl text-sm font-medium transition-colors"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl bg-[#18181b]">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-[#27272a]">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Cells */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
                    {days.map((day, dayIdx) => {
                        const dayTasks = getTasksForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    min-h-[100px] border-b border-r border-white/5 p-2 transition-colors relative group
                                    ${!isCurrentMonth ? 'bg-[#18181b]/50 text-gray-600' : 'bg-[#18181b]'}
                                    ${isDayToday ? 'bg-indigo-500/5' : ''}
                                    hover:bg-white/5
                                `}
                                onClick={() => setSelectedDate(day)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isDayToday
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-gray-400 group-hover:text-white'}
                                    `}>
                                        {format(day, dateFormat)}
                                    </span>
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                                    {dayTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`
                                                text-[10px] px-2 py-1 rounded-md border truncate
                                                ${task.status === 'done' ? 'opacity-50 line-through' : ''}
                                                ${task.priority === 'urgent' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                                                    task.priority === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' :
                                                        'bg-[#27272a] border-white/10 text-gray-300'}
                                            `}
                                            title={task.title}
                                        >
                                            {task.googleEventId && (
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 align-middle" title="Synced to Google Calendar"></span>
                                            )}
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
