import React, { useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { formatDistanceToNow, parseISO } from 'date-fns';

const Inbox = () => {
    const { tasks } = useTasks();

    const notifications = useMemo(() => {
        const notifs = [];

        tasks.forEach(task => {
            // 1. Urgent Tasks (that are not done)
            if (task.isUrgent && task.status !== 'done') {
                notifs.push({
                    id: `urgent-${task.id}`,
                    type: 'urgent',
                    title: 'Urgent Task',
                    message: `"${task.title}" is marked as urgent.`,
                    time: task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000) : new Date(task.createdAt || Date.now()), // Handle Firestore timestamp or ISO string fallback
                    priority: 1
                });
            }

            // 2. Completed Tasks (recently done - for simplicity, all done tasks in this view)
            if (task.status === 'done') {
                notifs.push({
                    id: `done-${task.id}`,
                    type: 'completed',
                    title: 'Task Completed',
                    message: `You completed "${task.title}". Great job!`,
                    time: task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000) : new Date(task.createdAt || Date.now()), // Ideally we'd have a 'completedAt' timestamp, but using createdAt as proxy or current time is tricky without data migration. 
                    // Better approach: If we don't have completedAt, maybe just show it.
                    // For now, let's use createdAt as the time, which is not ideal for "Completed" notifications but acceptable for MVP.
                    priority: 3
                });
            }

            // 3. New Tasks (created in last 24h) - excluding done tasks to avoid double noise
            const createdAt = task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000) : new Date(task.createdAt || Date.now());
            const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);

            if (hoursSinceCreation < 24 && task.status !== 'done' && !task.isUrgent) {
                notifs.push({
                    id: `new-${task.id}`,
                    type: 'new',
                    title: 'New Task Added',
                    message: `"${task.title}" was added to your list.`,
                    time: createdAt,
                    priority: 2
                });
            }
        });

        // Sort by priority then time
        return notifs.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.time - a.time;
        });
    }, [tasks]);

    const getTimeString = (date) => {
        try {
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    return (
        <div className="p-8 text-white max-w-4xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Inbox</h2>
                <div className="text-sm text-gray-500">
                    {notifications.length} notifications
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <span className="material-symbols-rounded text-4xl mb-2 block animate-pulse">notifications_paused</span>
                        No new notifications
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`bg-[#18181b] p-4 rounded-xl border border-white/5 flex gap-4 transition-colors cursor-pointer group ${notif.type === 'completed' ? 'opacity-75 hover:opacity-100' : 'hover:border-[var(--color-primary)]/50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    notif.type === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-blue-500/20 text-blue-400'
                                }`}>
                                <span className="material-symbols-rounded">
                                    {notif.type === 'urgent' ? 'warning' :
                                        notif.type === 'completed' ? 'check_circle' :
                                            'assignment'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm">{notif.title}</h4>
                                    <span className="text-xs text-gray-500">{getTimeString(notif.time)}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full self-center ${notif.type === 'urgent' ? 'bg-red-500' :
                                    notif.type === 'new' ? 'bg-blue-500' : 'bg-transparent'
                                }`}></div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">No more notifications</p>
            </div>
        </div>
    );
};

export default Inbox;
