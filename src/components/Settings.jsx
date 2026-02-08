import { useTasks } from '../context/TasksContext';
import { useState } from 'react';

const Settings = () => {
    const { subjects, addSubject, deleteSubject, updateSubject } = useTasks();
    const [newSubject, setNewSubject] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (newSubject.trim()) {
            addSubject(newSubject.trim());
            setNewSubject('');
        }
    };

    const startEditing = (subject) => {
        setEditingSubject(subject);
        setEditValue(subject);
    };

    const saveSubject = () => {
        if (editValue.trim() && editValue !== editingSubject) {
            updateSubject(editingSubject, editValue.trim());
        }
        setEditingSubject(null);
        setEditValue('');
    };

    const cancelEditing = () => {
        setEditingSubject(null);
        setEditValue('');
    };

    return (
        <div className="p-8 text-white max-w-4xl mx-auto custom-scrollbar overflow-y-auto h-full pb-20">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden mb-8">
                {/* Account Section */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Account</h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px]">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZtUDlAHK8bBL5U8R0J8Tic_1nzdTOrdX3jwkbDDZ7wUK5EEJtGB-Mv4QdGAok-FQPXpG1B4q7u2WOFEvklyseJ0_n7meoprUHPki16JlwRXZ_E8-p_7ogIpOGEjgLTlUFmokoubr5t1HoG3F_cXA6IaUe3utAytJqRGZqN3tFl7Wbl2qIO-l2zhcvqGICEf-QIRahNkzNG00l8xeFaT9QeaUrxAvs71Vbbn56xWdnMVnCPZMl-l5Petcyrwdm7KBq3yL3k0ZUqKc"
                                alt="User Avatar"
                                className="w-full h-full object-cover rounded-full border-2 border-[#18181b]"
                            />
                        </div>
                        <div>
                            <h4 className="font-medium">Alex Morgan</h4>
                            <p className="text-sm text-gray-400">alex.morgan@university.edu</p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Subject Management Section */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Manage Subjects</h3>
                    <div className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="New subject name..."
                            className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[var(--color-primary)]"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubject(e)}
                        />
                        <button
                            onClick={handleAddSubject}
                            disabled={!newSubject.trim()}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {subjects.map(sub => (
                            <div key={sub} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors group">
                                {editingSubject === sub ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveSubject}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveSubject();
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                        autoFocus
                                        className="bg-transparent text-sm text-white outline-none w-24 border-b border-[var(--color-primary)]"
                                    />
                                ) : (
                                    <>
                                        <span className="text-sm text-gray-200">{sub}</span>
                                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEditing(sub)}
                                                className="text-gray-500 hover:text-blue-400"
                                                title="Rename Subject"
                                            >
                                                <span className="material-symbols-rounded text-[16px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => deleteSubject(sub)}
                                                className="text-gray-500 hover:text-red-400"
                                                title="Delete Subject"
                                            >
                                                <span className="material-symbols-rounded text-[16px]">close</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-xs text-gray-500">Use system theme or force dark mode</p>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-green-400" />
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-xs text-gray-500">Receive updates about your tasks</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-[var(--color-primary)]" defaultChecked />
                        </div>
                    </div>
                </div>

                {/* App Info */}
                <div className="p-6 bg-white/2">
                    <p className="text-xs text-center text-gray-500">Kanban Board v1.2.0 • Build 2024.10.24</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
