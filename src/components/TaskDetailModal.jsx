import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TasksContext';

const TaskDetailModal = ({ task, onClose, mode = 'edit' }) => {
    const { addTask, updateTask, deleteTask, subjects } = useTasks(); // Destructure subjects

    // State for form fields
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [subject, setSubject] = useState(task?.subject || (subjects[0] || 'Physics')); // Default to first available subject
    const [date, setDate] = useState(task?.date || '');
    const [isUrgent, setIsUrgent] = useState(task?.isUrgent || false);
    const [attachments, setAttachments] = useState(task?.attachments || []);
    const [newFiles, setNewFiles] = useState([]);

    // UI State
    const [activeSection, setActiveSection] = useState('details'); // 'details', 'attachments', 'comments'
    const [isProcessing, setIsProcessing] = useState(false);

    // Load task data when in edit mode
    useEffect(() => {
        if (mode === 'edit' && task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setSubject(task.subject); // Ensure this matches one of the options if possible
            setDate(task.date);
            setIsUrgent(task.isUrgent);
            setAttachments(task.attachments || []);
        } else if (mode === 'create') {
            // Reset for create
            setSubject(subjects[0] || 'Physics');
        }
    }, [task, mode, subjects]); // Re-run if subjects change

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Basic validation
        const validFiles = selectedFiles.filter(file => file.size <= 500 * 1024);
        setNewFiles(prev => [...prev, ...validFiles]);
    };

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            // Process new files to Base64
            let newAttachments = [];
            if (newFiles.length > 0) {
                const filePromises = newFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve({
                            name: file.name,
                            type: file.type,
                            data: reader.result
                        });
                        reader.onerror = error => reject(error);
                    });
                });
                newAttachments = await Promise.all(filePromises);
            }

            const updatedData = {
                title,
                description,
                subject,
                date: date || 'Today',
                isUrgent,
                attachments: [...attachments, ...newAttachments]
            };

            if (mode === 'create') {
                await addTask(updatedData);
            } else {
                if (task?.id) {
                    await updateTask(task.id, updatedData);
                }
            }
            onClose();
        } catch (error) {
            console.error("Failed to save task:", error);
            alert("Error saving task.");
        }
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            setIsProcessing(true);
            await deleteTask(task.id);
            setIsProcessing(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#18181b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        {mode === 'create' ? 'New Task' : 'Edit Task'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {mode === 'edit' && (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Delete Task"
                            >
                                <span className="material-symbols-rounded">delete</span>
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                </div>

                {/* Body - Two Columns */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Sidebar (Navigation) */}
                    <div className="w-1/4 border-r border-white/5 bg-white/2 p-4 space-y-1">
                        <button
                            onClick={() => setActiveSection('details')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'details' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveSection('attachments')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'attachments' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Attachments ({attachments.length + newFiles.length})
                        </button>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {activeSection === 'details' && (
                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-[var(--color-background-dark)] border border-white/10 rounded-xl p-3 text-white focus:border-[var(--color-primary)] focus:outline-none"
                                        placeholder="Task Title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="4"
                                        className="w-full bg-[var(--color-background-dark)] border border-white/10 rounded-xl p-3 text-white focus:border-[var(--color-primary)] focus:outline-none resize-none"
                                        placeholder="Add more details..."
                                    />
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Subject</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-[var(--color-background-dark)] border border-white/10 rounded-xl p-3 text-white focus:border-[var(--color-primary)] focus:outline-none appearance-none"
                                        >
                                            {subjects.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                            {/* Include current subject even if it was deleted from settings, so it's not lost */}
                                            {activeSection === 'details' && subject && !subjects.includes(subject) && (
                                                <option key={subject} value={subject}>{subject} (Deleted)</option>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Due Date</label>
                                        <input
                                            type="text"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-[var(--color-background-dark)] border border-white/10 rounded-xl p-3 text-white focus:border-[var(--color-primary)] focus:outline-none"
                                            placeholder="e.g. Tomorrow"
                                        />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="urgent-edit"
                                        checked={isUrgent}
                                        onChange={(e) => setIsUrgent(e.target.checked)}
                                        className="rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500/50"
                                    />
                                    <label htmlFor="urgent-edit" className="text-sm font-medium text-gray-300">Mark as Urgent</label>
                                </div>
                            </div>
                        )}

                        {activeSection === 'attachments' && (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <span className="material-symbols-rounded text-3xl text-gray-500 mb-2">cloud_upload</span>
                                    <p className="text-sm text-gray-400">Click to upload files</p>
                                    <p className="text-xs text-gray-600 mt-1">Max 500KB per file</p>
                                </div>

                                <div className="space-y-2">
                                    {[...attachments, ...newFiles].map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-rounded text-gray-400">description</span>
                                                <span className="text-sm text-gray-200 truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            {/* We can add remove logic later */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#18181b] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 flex items-center gap-2"
                    >
                        {isProcessing && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
