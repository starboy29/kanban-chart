import React from 'react';

const Calendar = () => {
    return (
        <div className="p-8 text-white h-full flex flex-col items-center justify-center">
            <div className="bg-[#18181b] p-12 rounded-3xl border border-white/5 text-center">
                <div className="w-20 h-20 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-rounded text-5xl text-[var(--color-primary)]">calendar_month</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Calendar View</h2>
                <p className="text-gray-400 max-w-md">
                    Visualize your deadlines and schedule. This feature is currently in development.
                </p>
            </div>
        </div>
    );
};

export default Calendar;
