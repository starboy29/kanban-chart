import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { formatDistanceToNow } from 'date-fns';

const Inbox = () => {
    const { tasks, updateTask } = useTasks();
    const [filter, setFilter] = useState('all');

    const notifications = useMemo(() => {
        const notifs = [];

        tasks.forEach(task => {
            // 1. Urgent Tasks
            if ((task.priority === 'urgent' || task.isUrgent) && task.status !== 'done') {
                notifs.push({
                    id: `urgent-${task.id}`,
                    taskId: task.id,
                    type: 'urgent',
                    title: 'Urgent Action Required',
                    message: `"${task.title}" needs your immediate attention.`,
                    time: task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000) : new Date(task.createdAt || Date.now()),
                    priority: 1,
                    subject: task.subject
                });
            }

            // 2. Completed Tasks
            if (task.status === 'done') {
                notifs.push({
                    id: `done-${task.id}`,
                    taskId: task.id,
                    type: 'completed',
                    title: 'Task Milestone Reached',
                    message: `You successfully finished "${task.title}".`,
                    time: task.updatedAt?.seconds ? new Date(task.updatedAt.seconds * 1000) : new Date(task.createdAt || Date.now()),
                    priority: 3,
                    subject: task.subject
                });
            }

            // 3. New/Recent Unfinished Tasks
            const createdAt = task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000) : new Date(task.createdAt || Date.now());
            const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);

            if (hoursSinceCreation < 48 && task.status !== 'done' && task.priority !== 'urgent' && !task.isUrgent) {
                notifs.push({
                    id: `new-${task.id}`,
                    taskId: task.id,
                    type: 'recent',
                    title: 'Tracked Task',
                    message: `"${task.title}" is in your queue.`,
                    time: createdAt,
                    priority: 2,
                    subject: task.subject
                });
            }
        });

        const sorted = notifs.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.time - a.time;
        });

        if (filter === 'all') return sorted;
        if (filter === 'urgent') return sorted.filter(n => n.type === 'urgent');
        if (filter === 'completed') return sorted.filter(n => n.type === 'completed');
        return sorted;
    }, [tasks, filter]);

    const handleCompleteTask = async (taskId) => {
        await updateTask(taskId, { status: 'done', updatedAt: new Date().toISOString() });
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-[#141118] text-white overflow-hidden">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-1">Activity Center</h2>
                        <p className="text-gray-500 text-sm font-medium">Keep track of your latest updates and alerts.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm self-start md:self-center">
                        {['all', 'urgent', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                            <span className="material-symbols-rounded text-6xl mb-4 text-gray-400">notifications_off</span>
                            <h3 className="text-xl font-bold mb-2">No active notifications</h3>
                            <p className="text-sm max-w-xs mx-auto">You're all caught up! Go grab a coffee or start a new task.</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`
                                    group relative bg-[#1c191f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex gap-5 transition-all
                                    hover:bg-[#231f26] hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5
                                    ${notif.type === 'completed' ? 'opacity-60' : ''}
                                `}
                            >
                                {/* Icon / Status Indicator */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner ${notif.type === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        notif.type === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    }`}>
                                    <span className="material-symbols-rounded text-2xl">
                                        {notif.type === 'urgent' ? 'emergency_home' :
                                            notif.type === 'completed' ? 'verified' :
                                                'rocket_launch'}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-100 group-hover:text-white transition-colors">{notif.title}</h4>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-500 font-bold uppercase tracking-widest">{notif.subject}</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-tighter">
                                            {formatDistanceToNow(notif.time, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</p>

                                    {/* Actions */}
                                    {notif.type !== 'completed' && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={() => handleCompleteTask(notif.taskId)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20"
                                            >
                                                <span className="material-symbols-rounded text-[16px]">check_circle</span>
                                                Mark Complete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={`absolute top-5 right-5 w-1.5 h-1.5 rounded-full ${notif.type === 'urgent' ? 'bg-red-500 animate-ping' : notif.type === 'completed' ? 'bg-transparent' : 'bg-indigo-500 pulsate'}`}></div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Insight */}
                <div className="mt-8 py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-white">{notifications.length}</span> activities. Stay organized, stay productive.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-indigo-400 transition-colors">
                        Clear Dismissed Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
