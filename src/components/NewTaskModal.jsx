import React, { useState, useRef } from 'react';
import { useTasks } from '../context/TasksContext';
import { format } from 'date-fns';

const NewTaskModal = ({ onClose }) => {
    const { addTask, subjects, tags: globalTags, addTag } = useTasks();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(subjects[0] || 'Physics');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('medium'); // low, medium, high, urgent
    const [description, setDescription] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [processing, setProcessing] = useState(false);

    // Collapsible Sections State
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [isSubtasksOpen, setIsSubtasksOpen] = useState(false);
    const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

    const fileInputRef = useRef(null);

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Date.now(), title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const removeSubtask = (id) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = newTag.trim();
        if (tag) {
            if (!globalTags.includes(tag)) {
                addTag(tag); // Add to global list if new
            }
            if (!tags.includes(tag)) {
                setTags([...tags, tag]); // Add to current task
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

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Basic validation or processing can go here
        setAttachments([...attachments, ...selectedFiles]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // Process attachments - Upload to Firebase Storage
            // Process attachments (convert to base64)
            const processedAttachments = await Promise.all(attachments.map(file => {
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

            const newTask = {
                title,
                subject,
                date: date || '', // Use ISO date string or empty
                priority,
                isUrgent: priority === 'urgent', // Backward compatibility for now
                description,
                subtasks,
                tags,
                estimatedTime,
                attachments: processedAttachments,
                status: 'todo',
                createdAt: new Date().toISOString()
            };

            await addTask(newTask);
            onClose();
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Failed to create task. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-rounded text-indigo-400">add_task</span>
                        Create New Task
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-rounded text-2xl">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                    {/* Main Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-lg"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject / Category</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none appearance-none"
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
                                    className="w-full bg-[#27272a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none [color-scheme:dark]"
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
                                            <span className="text-gray-300 text-sm">{st.title}</span>
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
                                        <div key={idx} className="flex items-center justify-between bg-[#18181b] p-2 px-3 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="material-symbols-rounded text-gray-500 text-[18px]">draft</span>
                                                <span className="text-gray-300 text-sm truncate">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeAttachment(idx)} className="text-gray-500 hover:text-red-400">
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
                        onClick={handleSubmit}
                        disabled={!title.trim() || processing}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {processing && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                        Create Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewTaskModal;
