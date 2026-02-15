import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav = () => {
    const tabs = [
        { icon: 'dashboard', label: 'Home', to: '/' },
        { icon: 'view_kanban', label: 'Board', to: '/board' },
        { icon: 'percent', label: 'Attendance', to: '/attendance' },
        { icon: 'calendar_month', label: 'Calendar', to: '/calendar' },
        { icon: 'settings', label: 'Settings', to: '/settings' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141118]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {tabs.map(tab => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${isActive
                                ? 'text-[var(--color-primary)]'
                                : 'text-gray-500'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`relative p-1 rounded-2xl transition-all ${isActive ? 'bg-[var(--color-primary)]/15' : ''}`}>
                                    <span className={`material-symbols-rounded text-[22px] ${isActive ? 'font-bold' : ''}`}>
                                        {tab.icon}
                                    </span>
                                </div>
                                <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {tab.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default MobileNav;
