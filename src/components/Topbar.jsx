import React from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TasksContext';

const Topbar = () => {
    const { searchQuery, setSearchQuery, viewMode, setViewMode } = useTasks();

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
            </div>
        </header>
    );
};

export default Topbar;
