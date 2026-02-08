import React from 'react';

const ListView = ({ tasks }) => {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="material-symbols-rounded text-6xl mb-4 opacity-20">assignment</span>
                <p>No tasks found.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'inprogress': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'done': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    const getSubjectColor = (subject) => {
        switch (subject) {
            case 'Physics': return 'text-purple-400';
            case 'Math': return 'text-blue-400';
            case 'Literature': return 'text-amber-400';
            case 'Biology': return 'text-emerald-400';
            case 'Art History': return 'text-pink-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#18181b] sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b border-white/5">Title</th>
                            <th className="px-6 py-4 border-b border-white/5">Subject</th>
                            <th className="px-6 py-4 border-b border-white/5">Status</th>
                            <th className="px-6 py-4 border-b border-white/5">Due Date</th>
                            <th className="px-6 py-4 border-b border-white/5 text-right opacity-0">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${task.isUrgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-600'}`}></div>
                                        <span className={`font-medium text-white ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${getSubjectColor(task.subject)}`}>
                                        {task.subject}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status === 'todo' ? 'To Do' :
                                            task.status === 'inprogress' ? 'In Progress' : 'Done'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                    {task.date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-rounded">more_horiz</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListView;
