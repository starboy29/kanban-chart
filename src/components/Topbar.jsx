import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
    const { searchQuery, setSearchQuery, viewMode, setViewMode } = useTasks();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#141118]">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Kanban Board</h2>
                <div className="h-6 w-[1px] bg-gray-700 mx-2"></div>
                <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">View:</span>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-1 font-medium px-2 py-1 rounded transition-colors ${viewMode === 'board'
                            ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                            : 'hover:bg-white/5 hover:text-gray-200'
                            }`}
                    >
                        <span className="material-symbols-rounded text-[18px]">view_kanban</span>
                        Board
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1 ml-2 font-medium px-2 py-1 rounded transition-colors ${viewMode === 'list'
                            ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                            : 'hover:bg-white/5 hover:text-gray-200'
                            }`}
                    >
                        <span className="material-symbols-rounded text-[18px]">list</span>
                        List
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative w-64 hidden md:block group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors">
                        <span className="material-symbols-rounded text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-[var(--color-surface-dark)] border-none rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all"
                        placeholder="Search tasks..."
                    />
                </div>

                {/* Notifications */}
                <Link to="/inbox" className="relative p-2 text-gray-400 hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-rounded">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#141118]"></span>
                </Link>

                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-white/5 p-1 px-2 rounded-full transition-colors"
                    >
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-8 h-8 rounded-full border border-white/10"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#18181b]">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-300 hidden sm:block max-w-[100px] truncate">
                            {user?.displayName || user?.email?.split('@')[0]}
                        </span>
                        <span className="material-symbols-rounded text-gray-500 text-[18px]">expand_more</span>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm text-white font-medium truncate">{user?.displayName}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
