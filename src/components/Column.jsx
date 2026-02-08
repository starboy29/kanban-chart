import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { useTasks } from '../context/TasksContext';

const Column = ({ title, status, count, tasks, onNewTask, onTaskClick }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });
    const { renameColumn } = useTasks();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    const handleRename = () => {
        if (editTitle.trim()) {
            renameColumn(status, editTitle);
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 flex flex-col min-w-[320px] bg-[#18181b] rounded-2xl border border-white/5 p-2 h-full ${status === 'done' ? 'opacity-75 hover:opacity-100 transition-opacity' : ''}`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            autoFocus
                            className="bg-[#27272a] text-white text-sm font-bold px-2 py-1 rounded border border-[var(--color-primary)] outline-none w-full"
                        />
                    ) : (
                        <h3
                            className="font-bold text-gray-200 cursor-pointer hover:text-white"
                            onDoubleClick={() => setIsEditing(true)}
                            title="Double click to rename"
                        >
                            {title}
                        </h3>
                    )}
                    <span className="bg-white/10 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-200">
                    <span className="material-symbols-rounded text-[20px]">more_horiz</span>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2 space-y-3">
                {/* Urgent Section for ToDo */}
                {status === 'todo' && tasks.some(t => t.isUrgent) && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-3 text-red-400">
                            <span className="material-symbols-rounded text-[18px] fill-current">priority_high</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Urgent • Due Today</span>
                        </div>
                        {tasks.filter(t => t.isUrgent).map(task => (
                            <TaskCard key={task.id} task={task} isUrgentWrapper onClick={() => onTaskClick(task)} />
                        ))}
                    </div>
                )}

                {/* Regular Tasks */}
                {tasks.filter(t => !t.isUrgent || status !== 'todo').map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
            </div>

            {/* Add Card Button */}
            <button
                onClick={onNewTask}
                className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
            >
                <span className="material-symbols-rounded text-[18px]">add</span>
                Add Card
            </button>
        </div>
    );
};

export default Column;
