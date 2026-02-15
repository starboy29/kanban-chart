import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, isOverlay, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        cursor: isOverlay ? 'grabbing' : 'grab',
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'urgent': return {
                border: 'border-red-500/50',
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                accent: 'bg-red-500',
                glow: 'shadow-red-500/20'
            };
            case 'high': return {
                border: 'border-orange-500/50',
                bg: 'bg-orange-500/10',
                text: 'text-orange-400',
                accent: 'bg-orange-500',
                glow: 'shadow-orange-500/20'
            };
            case 'medium': return {
                border: 'border-blue-500/50',
                bg: 'bg-blue-500/10',
                text: 'text-blue-400',
                accent: 'bg-blue-500',
                glow: 'shadow-blue-500/20'
            };
            case 'low': return {
                border: 'border-emerald-500/50',
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-400',
                accent: 'bg-emerald-500',
                glow: 'shadow-emerald-500/20'
            };
            default: return {
                border: 'border-white/10',
                bg: 'bg-white/5',
                text: 'text-gray-400',
                accent: 'bg-gray-500',
                glow: ''
            };
        }
    };

    const getSubjectBadgeColor = (subject) => {
        const colors = {
            'Physics': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            'Math': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            'Literature': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            'Biology': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            'Art History': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
            'Computer Science': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
        return colors[subject] || 'bg-gray-500/20 text-gray-300 border-white/10';
    };

    const priority = task.priority || (task.isUrgent ? 'urgent' : 'medium');
    const pStyles = getPriorityStyles(priority);

    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const hasSubtasks = subtasks.length > 0;
    const progress = hasSubtasks ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

    const attachmentsCount = (task.attachments?.length || 0) + (task.attachment ? 1 : 0) + (task.image ? 1 : 0);

    return (
        <div
            ref={setNodeRef}
            style={!isOverlay ? style : {}}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`
                relative bg-[#1c191f]/80 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-3 
                ${isOverlay ? 'shadow-2xl border-indigo-500/50 scale-105 rotate-1 ring-2 ring-indigo-500/20' : 'hover:border-white/20 hover:bg-[#231f26]'} 
                transition-all duration-200 group overflow-hidden
            `}
        >
            {/* Priority Left Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${pStyles.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />

            {/* Header: Subject & Priority Tag */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSubjectBadgeColor(task.subject)}`}>
                        {task.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${pStyles.bg} ${pStyles.text} border border-white/5`}>
                        {priority}
                    </span>
                </div>
                {task.status === 'done' ? (
                    <span className="material-symbols-rounded text-emerald-400 text-[18px]">check_circle</span>
                ) : (
                    <span className="material-symbols-rounded text-gray-500 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">edit_note</span>
                )}
            </div>

            {/* Title */}
            <h4 className={`text-[15px] font-semibold text-white mb-3 leading-snug tracking-tight ${task.status === 'done' ? 'line-through text-gray-500 opacity-60' : ''}`}>
                {task.title}
            </h4>

            {/* Attachments Preview (Compact) */}
            {attachmentsCount > 0 && (
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 py-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[11px] text-gray-400">
                        <span className="material-symbols-rounded text-[14px]">attach_file</span>
                        <span>{attachmentsCount} {attachmentsCount === 1 ? 'file' : 'files'}</span>
                    </div>
                    {task.attachments?.[0]?.type?.startsWith('image/') && (
                        <div className="w-6 h-6 rounded border border-white/10 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
                            <img src={task.attachments[0].data} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            )}

            {/* Subtasks Progress */}
            {hasSubtasks && (
                <div className="mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-rounded text-[14px]">checklist</span>
                            Subtasks
                        </span>
                        <span className={progress === 100 ? 'text-emerald-400' : 'text-indigo-400'}>
                            {completedSubtasks}/{subtasks.length}
                        </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-1">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${task.status === 'done' ? 'bg-emerald-500/5 text-emerald-500/70' : 'bg-white/5 text-gray-400'} text-[11px] font-medium border border-white/5`}>
                    <span className="material-symbols-rounded text-[14px]">
                        {task.status === 'done' ? 'event_available' : 'calendar_today'}
                    </span>
                    <span>{task.date || 'No date'}</span>
                </div>

                {/* Source/Integrations */}
                <div className="flex items-center gap-2">
                    {task.googleEventId && (
                        <span className="material-symbols-rounded text-blue-400 text-[16px]" title="Synced with Google Calendar">sync</span>
                    )}
                    {task.source === 'telegram' && (
                        <div className="w-4 h-4 rounded-full bg-[#24A1DE] flex items-center justify-center text-white p-[3px]" title="From Telegram">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 0l-6 22-10-11 9-4-10 11-7-6zm-24 9l13 10-13-10z" /></svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
