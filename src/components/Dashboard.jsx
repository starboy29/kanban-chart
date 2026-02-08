import React from 'react';
import { useTasks } from '../context/TasksContext';

const Dashboard = () => {
    const { tasks } = useTasks();

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'inprogress').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const urgentTasks = tasks.filter(t => t.isUrgent && t.status !== 'done').length;

    return (
        <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Tasks" count={totalTasks} icon="assignment" color="bg-blue-500" />
                <StatCard title="Pending" count={pendingTasks} icon="hourglass_empty" color="bg-amber-500" />
                <StatCard title="Completed" count={completedTasks} icon="check_circle" color="bg-emerald-500" />
                <StatCard title="Urgent" count={urgentTasks} icon="warning" color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="font-medium text-sm truncate max-w-[200px]">{task.title}</span>
                                <span className={`text-xs px-2 py-1 rounded ${task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                                        task.status === 'inprogress' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {task.status === 'todo' ? 'To Do' :
                                        task.status === 'inprogress' ? 'In Progress' : 'Done'}
                                </span>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
                    </div>
                </div>

                <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-rounded text-6xl text-gray-700 mb-4 block">bar_chart</span>
                        <p className="text-gray-500">Analytics coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, icon, color }) => (
    <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
            <span className="material-symbols-rounded text-white text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h4 className="text-2xl font-bold">{count}</h4>
        </div>
    </div>
);

export default Dashboard;
