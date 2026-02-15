import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TasksContext';
import { format } from 'date-fns';

const TaskDetailModal = ({ task, onClose }) => {
    const { updateTask, deleteTask, subjects, tags: globalTags, addTag } = useTasks();

    // State for form fields
    const [title, setTitle] = useState(task?.title || '');
    const [subject, setSubject] = useState(task?.subject || (subjects[0] || 'Physics'));
    const [date, setDate] = useState(task?.date || '');
    const [priority, setPriority] = useState(task?.priority || (task?.isUrgent ? 'urgent' : 'medium'));
    const [description, setDescription] = useState(task?.description || '');
    const [subtasks, setSubtasks] = useState(task?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [tags, setTags] = useState(task?.tags || []);
    const [newTag, setNewTag] = useState('');
    const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || '');
    const [attachments, setAttachments] = useState(task?.attachments || []);
    const [processing, setProcessing] = useState(false);

    // Collapsible Sections State
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);
    const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

    const fileInputRef = useRef(null);

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Date.now(), title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const toggleSubtask = (id) => {
        setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
    };

    const removeSubtask = (id) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = newTag.trim();
        if (tag) {
            if (!globalTags.includes(tag)) {
                addTag(tag);
            }
            if (!tags.includes(tag)) {
                setTags([...tags, tag]);
            }
            setNewTag('');
        }
    };

    const toggleTag = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        const processed = await Promise.all(selectedFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
                reader.onerror = reject;
            });
        }));
        setAttachments([...attachments, ...processed]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const updatedTask = {
                title,
                subject,
                date: date || '',
                priority,
                isUrgent: priority === 'urgent',
                description,
                subtasks,
                tags,
                estimatedTime,
                attachments,
            };

            await updateTask(task.id, updatedTask);
            onClose();
        } catch (error) {
            console.error("Failed to update task:", error);
            alert("Failed to update task. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            setProcessing(true);
            try {
                await deleteTask(task.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete task:", error);
                alert("Error deleting task.");
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm md:p-4">
            <div className="bg-[#18181b] w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5">
                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-rounded text-indigo-400">edit_note</span>
                        Edit Task
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-rounded text-2xl">delete</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <span className="material-symbols-rounded text-2xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 md:space-y-6">

                    {/* Main Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-lg font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject / Category</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none appearance-none font-medium"
                                >
                                    {subjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Due Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none [color-scheme:dark] font-medium"
                                />
                            </div>
                        </div>

                        {/* Quick Tags Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {globalTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tags.includes(tag)
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                            : 'bg-[#27272a] border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                                    placeholder="New tag..."
                                    className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-rounded">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible: Additional Details */}
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#27272a]/30">
                        <button
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-gray-400">description</span>
                                <span className="font-medium text-gray-200">Description & Priority</span>
                            </div>
                            <span className={`material-symbols-rounded text-gray-400 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {isDetailsOpen && (
                            <div className="p-4 pt-0 space-y-4 border-t border-white/5 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Priority Level</label>
                                    <div className="flex gap-2">
                                        {['low', 'medium', 'high', 'urgent'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${priority === p
                                                    ? p === 'urgent' ? 'bg-red-500/20 border-red-500 text-red-400'
                                                        : p === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                            : p === 'medium' ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                                : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                    : 'bg-[#27272a] border-white/5 text-gray-500 hover:border-white/20'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add details about this task..."
                                        className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 outline-none min-h-[100px] resize-y"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collapsible: Subtasks */}
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#27272a]/30">
                        <button
                            onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-gray-400">checklist</span>
                                <span className="font-medium text-gray-200">Subtasks ({subtasks.length})</span>
                            </div>
                            <span className={`material-symbols-rounded text-gray-400 transition-transform ${isSubtasksOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {isSubtasksOpen && (
                            <div className="p-4 pt-0 border-t border-white/5 mt-2">
                                <div className="space-y-2 mb-3">
                                    {subtasks.map(st => (
                                        <div key={st.id} className="flex items-center justify-between bg-[#18181b] p-2 px-3 rounded-lg border border-white/5 group">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleSubtask(st.id)}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    {st.completed && <span className="material-symbols-rounded text-white text-[14px]">check</span>}
                                                </button>
                                                <span className={`text-sm transition-all ${st.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{st.title}</span>
                                            </div>
                                            <button onClick={() => removeSubtask(st.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-rounded text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)}
                                        placeholder="Add a subtask..."
                                        className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                    />
                                    <button
                                        onClick={handleAddSubtask}
                                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-rounded">add</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collapsible: Attachments */}
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#27272a]/30">
                        <button
                            onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-gray-400">attach_file</span>
                                <span className="font-medium text-gray-200">Attachments ({attachments.length})</span>
                            </div>
                            <span className={`material-symbols-rounded text-gray-400 transition-transform ${isAttachmentsOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {isAttachmentsOpen && (
                            <div className="p-4 pt-0 border-t border-white/5 mt-2">
                                <div className="space-y-2 mb-3">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-[#18181b] p-2 px-3 rounded-lg border border-white/5 group">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="material-symbols-rounded text-gray-500 text-[18px]">draft</span>
                                                {file.data ? (
                                                    <span className="text-gray-300 text-sm truncate">{file.name}</span>
                                                ) : (
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm truncate">{file.name}</a>
                                                )}
                                            </div>
                                            <button onClick={() => removeAttachment(idx)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-rounded text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-rounded">upload_file</span>
                                    Click to upload files
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#18181b] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || processing}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {processing && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
