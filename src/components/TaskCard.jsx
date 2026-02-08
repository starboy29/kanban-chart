import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, isUrgentWrapper, isOverlay, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    const getSubjectColor = (subject) => {
        switch (subject) {
            case 'Physics': return 'bg-purple-500/20 text-purple-300';
            case 'Math': return 'bg-blue-500/20 text-blue-300';
            case 'Literature': return 'bg-amber-500/20 text-amber-300';
            case 'Biology': return 'bg-emerald-500/20 text-emerald-300';
            case 'Art History': return 'bg-pink-500/20 text-pink-300';
            case 'History':
            case 'Computer Science':
                return 'bg-gray-700 text-gray-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    // Helper to render a single attachment
    const renderAttachment = (attachment, index) => {
        // Legacy support for single attachment object or image string
        if (!attachment) return null;

        if (attachment.type === 'link') {
            return (
                <a
                    key={index}
                    href={attachment.data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors group/link"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="material-symbols-rounded text-blue-400 text-[18px]">link</span>
                    <span className="text-xs text-blue-300 truncate flex-1">External Link</span>
                    <span className="material-symbols-rounded text-blue-400 text-[14px]">open_in_new</span>
                </a>
            );
        }

        if (attachment.type && attachment.type.startsWith('image/')) {
            return (
                <div key={index} className="w-full h-24 mb-2 rounded-lg overflow-hidden relative group/image border border-white/5">
                    <img
                        src={attachment.data}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        // Default: Downloadable file
        return (
            <a
                key={index}
                href={attachment.data}
                download={attachment.name}
                className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group/file border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-6 h-6 rounded bg-gray-700 text-gray-400 flex items-center justify-center">
                    <span className="material-symbols-rounded text-[16px]">description</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{attachment.name}</p>
                </div>
                <span className="material-symbols-rounded text-gray-400 group-hover/file:text-white text-[16px]">download</span>
            </a>
        );
    };

    // Normalize attachments to an array
    const attachments = task.attachments || (task.attachment ? [task.attachment] : []) || (task.image ? [{ type: 'image/jpeg', data: task.image, name: 'Image' }] : []);

    return (
        <div
            ref={setNodeRef}
            style={!isOverlay ? style : {}}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`bg-[#27272a] p-4 rounded-xl shadow-sm border border-white/5 
            ${isOverlay ? 'shadow-2xl border-[var(--color-primary)] cursor-grabbing scale-105 rotate-2' : 'hover:border-[var(--color-primary)]/50'} 
            transition-all group relative ${isUrgentWrapper && !isOverlay ? 'mb-3 last:mb-0' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSubjectColor(task.subject)}`}>
                    {task.subject}
                </span>
                {task.status === 'done' ? (
                    <span className="material-symbols-rounded text-green-500 text-[20px]">check_circle</span>
                ) : (
                    <span className="material-symbols-rounded text-gray-400 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                )}
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="mb-3">
                    {attachments.map((att, index) => renderAttachment(att, index))}
                </div>
            )}

            {/* Title */}
            <h4 className={`text-sm font-semibold text-white mb-3 leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                {task.title}
            </h4>

            {/* Progress Bar */}
            {task.progress !== undefined && (
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                    <div className="bg-[var(--color-primary)] h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                {/* Date / Urgent Indicator */}
                {task.isUrgent ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                        <span className="material-symbols-rounded text-[14px]">schedule</span>
                        <span>{task.date}</span>
                    </div>
                ) : (
                    <div className={`flex items-center gap-1.5 text-xs ${task.status === 'done' ? 'text-gray-400' : 'text-gray-400'}`}>
                        <span className="material-symbols-rounded text-[14px]">{task.status === 'done' ? 'event_available' : 'calendar_today'}</span>
                        <span>{task.date}</span>
                    </div>
                )}

                {/* Source Icon / Avatars */}
                {task.source === 'telegram' && (
                    <div className="w-5 h-5 rounded-full bg-[#24A1DE] flex items-center justify-center text-white" title="Via Telegram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M24 0l-6 22-10-11 9-4-10 11-7-6zm-24 9l13 10-13-10z" /></svg>
                    </div>
                )}
                {task.source === 'whatsapp' && (
                    <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white" title="Via WhatsApp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
