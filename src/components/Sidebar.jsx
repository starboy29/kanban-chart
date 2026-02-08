import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useTasks } from '../context/TasksContext';

const Sidebar = ({ onNewTask }) => {
    // 1. Destructure 'subjects' from context
    const { subjects, tasks } = useTasks();

    // 2. Sort subjects alphabetically for consistency
    const activeSubjects = [...subjects].sort();

    // 3. Calculate Inbox Count (Urgent, not done)
    const inboxCount = useMemo(() => {
        return tasks.filter(t => t.isUrgent && t.status !== 'done').length;
    }, [tasks]);

    const getSubjectIcon = (subject) => {
        const map = {
            'Physics': 'science',
            'Math': 'calculate',
            'Literature': 'menu_book',
            'Biology': 'biotech',
            'History': 'history_edu',
            'Computer Science': 'terminal',
            'Art History': 'palette',
            'Personal': 'person'
        };
        return map[subject] || 'school'; // fallback icon
    };

    return (
        <aside className="w-64 h-full border-r border-white/10 flex flex-col bg-[#141118]">
            {/* User Profile & Action */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px]">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZtUDlAHK8bBL5U8R0J8Tic_1nzdTOrdX3jwkbDDZ7wUK5EEJtGB-Mv4QdGAok-FQPXpG1B4q7u2WOFEvklyseJ0_n7meoprUHPki16JlwRXZ_E8-p_7ogIpOGEjgLTlUFmokoubr5t1HoG3F_cXA6IaUe3utAytJqRGZqN3tFl7Wbl2qIO-l2zhcvqGICEf-QIRahNkzNG00l8xeFaT9QeaUrxAvs71Vbbn56xWdnMVnCPZMl-l5Petcyrwdm7KBq3yL3k0ZUqKc"
                            alt="User Avatar"
                            className="w-full h-full object-cover rounded-full border-2 border-[#141118]"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold leading-tight text-white">Alex Morgan</h1>
                        <p className="text-xs text-gray-400">Fall Semester '24</p>
                    </div>
                </div>

                <button
                    onClick={onNewTask}
                    className="w-full h-10 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                    <span className="material-symbols-rounded text-[20px]">add</span>
                    New Task
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {/* Overview Group */}
                <div className="flex flex-col gap-1">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</div>
                    <NavItem icon="dashboard" label="Dashboard" to="/" />
                    <NavItem icon="view_kanban" label="Board" to="/board" />
                    <NavItem icon="calendar_month" label="Calendar" to="/calendar" />
                    <NavItem icon="inbox" label="Inbox" to="/inbox" badge={inboxCount > 0 ? inboxCount.toString() : null} />
                </div>

                {/* Subjects Group */}
                <div className="flex flex-col gap-1">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subjects</div>
                    {activeSubjects.map(subject => (
                        <NavItem
                            key={subject}
                            icon={getSubjectIcon(subject)}
                            label={subject}
                            to={`/subject/${subject.toLowerCase()}`}
                        />
                    ))}
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${isActive ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
                    }
                >
                    <span className="material-symbols-rounded text-[22px]">settings</span>
                    <span className="text-sm">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

const NavItem = ({ icon, label, to, badge }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${isActive ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white mb-1'}`
            }
        >
            <span className="material-symbols-rounded text-[22px]">{icon}</span>
            <span className="text-sm truncate">{label}</span>
            {badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </NavLink>
    );
};

export default Sidebar;
