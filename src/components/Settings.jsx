import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Settings = () => {
    const { subjects, addSubject, deleteSubject, updateSubject, tags, addTag, deleteTag, updateTag, calendarSyncEnabled, toggleCalendarSync, syncAllToCalendar, calendarSyncing } = useTasks();
    const { user, refreshGoogleToken, googleAccessToken } = useAuth(); // Use AuthContext properly
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

    // Tag Management Handlers
    const [newTag, setNewTag] = useState('');
    const [editingTag, setEditingTag] = useState(null);
    const [editTagValue, setEditTagValue] = useState('');

    const handleAddTag = (e) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTag(newTag.trim());
            setNewTag('');
        }
    };

    const startEditingTag = (tag) => {
        setEditingTag(tag);
        setEditTagValue(tag);
    };

    const saveTag = () => {
        if (editTagValue.trim() && editTagValue !== editingTag) {
            updateTag(editingTag, editTagValue.trim());
        }
        setEditingTag(null);
        setEditTagValue('');
    };

    const cancelEditingTag = () => {
        setEditingTag(null);
        setEditTagValue('');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-full border-2 border-[#18181b]"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#1c191f] rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-[#18181b]">
                                    {getInitials(user?.displayName || user?.email)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium">{user?.displayName || 'Student'}</h4>
                            <p className="text-sm text-gray-400">{user?.email}</p>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest font-mono">UID: {user?.uid}</p>
                        </div>
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

                {/* Tag Management Section */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold mb-4">Manage Tags</h3>
                    <div className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="New tag name (e.g. Urgent)..."
                            className="flex-1 bg-[#27272a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[var(--color-primary)]"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                        />
                        <button
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors group">
                                {editingTag === tag ? (
                                    <input
                                        type="text"
                                        value={editTagValue}
                                        onChange={(e) => setEditTagValue(e.target.value)}
                                        onBlur={saveTag}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTag();
                                            if (e.key === 'Escape') cancelEditingTag();
                                        }}
                                        autoFocus
                                        className="bg-transparent text-sm text-white outline-none w-24 border-b border-[var(--color-primary)]"
                                    />
                                ) : (
                                    <>
                                        <span className="text-sm text-gray-200">#{tag}</span>
                                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEditingTag(tag)}
                                                className="text-gray-500 hover:text-blue-400"
                                                title="Rename Tag"
                                            >
                                                <span className="material-symbols-rounded text-[16px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => deleteTag(tag)}
                                                className="text-gray-500 hover:text-red-400"
                                                title="Delete Tag"
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

                {/* Google Calendar Sync Section */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-rounded text-2xl text-blue-400">calendar_month</span>
                        <h3 className="text-lg font-semibold">Google Calendar Sync</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-5">
                        Automatically sync your tasks to Google Calendar. Once enabled, any task you create, edit, or delete will be reflected in your Google Calendar — viewable on all your devices including mobile.
                    </p>

                    {/* Sync Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#27272a] rounded-xl border border-white/5 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${calendarSyncEnabled ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30' : 'bg-gray-600'}`}></div>
                            <div>
                                <p className="font-medium">{calendarSyncEnabled ? 'Sync Enabled' : 'Sync Disabled'}</p>
                                <p className="text-xs text-gray-500">
                                    {calendarSyncEnabled
                                        ? 'Tasks are automatically synced to Google Calendar'
                                        : 'Enable to auto-sync tasks to Google Calendar'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleCalendarSync(!calendarSyncEnabled)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${calendarSyncEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${calendarSyncEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center justify-between p-4 bg-[#27272a] rounded-xl border border-white/5 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-rounded text-gray-400">account_circle</span>
                            <div>
                                <p className="text-sm font-medium">Google Account</p>
                                <p className="text-xs text-gray-500">
                                    {googleAccessToken ? 'Connected — Calendar access granted' : 'Not connected — sign out and sign back in to grant access'}
                                </p>
                            </div>
                        </div>
                        {!googleAccessToken && (
                            <button
                                onClick={refreshGoogleToken}
                                className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
                            >
                                Connect
                            </button>
                        )}
                        {googleAccessToken && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <span className="material-symbols-rounded text-[14px]">check_circle</span>
                                Connected
                            </span>
                        )}
                    </div>

                    {/* Sync All Button */}
                    {calendarSyncEnabled && googleAccessToken && (
                        <button
                            onClick={syncAllToCalendar}
                            disabled={calendarSyncing}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                        >
                            {calendarSyncing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Syncing All Tasks...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-rounded">sync</span>
                                    Sync All Tasks Now
                                </>
                            )}
                        </button>
                    )}

                    {/* Instructions */}
                    {calendarSyncEnabled && (
                        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                            <p className="text-xs text-blue-200/70 leading-relaxed">
                                <span className="font-medium text-blue-300">💡 Tip:</span> After syncing, open Google Calendar on your phone to see your tasks. Events will have a 📌 prefix and include your task details like subject, priority, and tags.
                            </p>
                        </div>
                    )}
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
