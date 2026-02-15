import React, { useState } from 'react';
import { useTasks } from '../context/TasksContext';

// ── helpers ──────────────────────────────────────────
const calcPercentage = (attended, total) =>
    total === 0 ? 100 : Math.round((attended / total) * 10000) / 100;

const classesToReachTarget = (attended, total, target = 75) => {
    if (calcPercentage(attended, total) >= target) return 0;
    const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
    return Math.max(0, needed);
};

const classesCanSkip = (attended, total, target = 75) => {
    if (calcPercentage(attended, total) < target) return 0;
    const canSkip = Math.floor((100 * attended - target * total) / target);
    return Math.max(0, canSkip);
};

const getStatusColor = (pct) => {
    if (pct >= 85) return {
        color: '#10b981', // emerald
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        light: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    };
    if (pct >= 75) return {
        color: '#f59e0b', // amber
        bg: 'bg-amber-500',
        text: 'text-amber-400',
        light: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    };
    return {
        color: '#f43f5e', // rose/red
        bg: 'bg-rose-500',
        text: 'text-rose-400',
        light: 'bg-rose-500/10',
        border: 'border-rose-500/20'
    };
};

// ── default subjects from SRM portal ─────────────────
const DEFAULT_SUBJECTS = [
    { id: '1', code: '21CSC204J', name: 'Design & Analysis of Algorithms', attended: 16, total: 24 },
    { id: '2', code: '21CSC205P', name: 'Database Management Systems', attended: 13, total: 19 },
    { id: '3', code: '21CSC206T', name: 'Artificial Intelligence', attended: 10, total: 14 },
    { id: '4', code: '21CSE251T', name: 'Digital Image Processing', attended: 12, total: 15 },
    { id: '5', code: '21DCS201P', name: 'Design Thinking & Methodology', attended: 15, total: 18 },
    { id: '6', code: '21MAB204T', name: 'Probability & Queuing Theory', attended: 13, total: 16 },
    { id: '7', code: '21PDH209T', name: 'Social Engineering', attended: 6, total: 8 },
    { id: '8', code: 'CLC2', name: 'Critical & Creative Thinking Skills', attended: 6, total: 8 },
];

const Attendance = () => {
    const { attendanceData, updateAttendance } = useTasks();
    const [targetPct, setTargetPct] = useState(75);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState(null);

    const subjects = attendanceData?.length > 0 ? attendanceData : DEFAULT_SUBJECTS;

    const totalAttended = subjects.reduce((s, sub) => s + sub.attended, 0);
    const totalClasses = subjects.reduce((s, sub) => s + sub.total, 0);
    const overallPct = calcPercentage(totalAttended, totalClasses);
    const status = getStatusColor(overallPct);
    const riskCount = subjects.filter(s => calcPercentage(s.attended, s.total) < 75).length;

    const handleMark = (id, present) => {
        const updated = subjects.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    total: s.total + 1,
                    attended: present ? s.attended + 1 : s.attended
                };
            }
            return s;
        });
        updateAttendance(updated);
    };

    const handleEdit = (id, field, val) => {
        const updated = subjects.map(s => {
            if (s.id === id) return { ...s, [field]: Number(val) || 0 };
            return s;
        });
        updateAttendance(updated);
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this subject?')) {
            updateAttendance(subjects.filter(s => s.id !== id));
        }
    };

    return (
        <div className="min-h-full bg-[#0f0f12]">
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Attendance</h1>
                        <p className="text-gray-500 text-sm">Real-time tracking of your academic progress</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[#1a1a1e] p-1 rounded-xl border border-white/5">
                            {[75, 80, 85, 90].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTargetPct(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${targetPct === t
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg'
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {t}%
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white"
                        >
                            <span className="material-symbols-rounded text-[24px]">add</span>
                        </button>
                    </div>
                </div>

                {/* Main Stats Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c21] to-[#141418] rounded-3xl border border-white/5 p-6 md:p-8">
                    {/* Background Glow */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${status.bg}`} />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Circle Progress */}
                        <div className="flex-shrink-0 relative group">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80" cy="80" r="72"
                                    className="stroke-[#2a2a2e]"
                                    strokeWidth="10"
                                    fill="transparent"
                                />
                                <circle
                                    cx="80" cy="80" r="72"
                                    stroke={status.color}
                                    strokeWidth="10"
                                    strokeDasharray={452.4}
                                    strokeDashoffset={452.4 - (452.4 * overallPct) / 100}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">{overallPct.toFixed(1)}%</span>
                                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Overall</span>
                            </div>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <StatBox icon="check_circle" label="Attended" value={totalAttended} color="text-emerald-400" />
                            <StatBox icon="school" label="Total" value={totalClasses} color="text-blue-400" />
                            <StatBox icon="cancel" label="Absent" value={totalClasses - totalAttended} color="text-rose-400" />
                            <StatBox icon="warning" label="Risk" value={riskCount} color={riskCount > 0 ? 'text-rose-400' : 'text-emerald-400'} />
                        </div>
                    </div>

                    {/* Quick Insight Bar */}
                    <div className={`mt-8 p-4 rounded-2xl border ${status.border} ${status.light} backdrop-blur-sm`}>
                        <div className="flex items-center gap-3">
                            <span className={`material-symbols-rounded ${status.text}`}>
                                {overallPct < targetPct ? 'trending_down' : 'auto_awesome'}
                            </span>
                            <p className="text-sm font-medium">
                                {overallPct < targetPct ? (
                                    <>You need to attend <span className="font-bold underline">{classesToReachTarget(totalAttended, totalClasses, targetPct)}</span> more classes to hit your {targetPct}% target.</>
                                ) : (
                                    <>You're safe! You can skip <span className="font-bold underline">{classesCanSkip(totalAttended, totalClasses, targetPct)}</span> more classes while staying above {targetPct}%.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid of Subject Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map(sub => {
                        const pct = calcPercentage(sub.attended, sub.total);
                        const s = getStatusColor(pct);
                        const isEditing = editingSubjectId === sub.id;

                        return (
                            <div
                                key={sub.id}
                                className="group relative bg-[#18181b] hover:bg-[#1a1a1e] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 p-5 overflow-hidden"
                            >
                                {/* Indicator line */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bg}`} />

                                <div className="space-y-5">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                                    {sub.code}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white leading-tight truncate">{sub.name}</h3>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className={`text-xl font-black ${s.text}`}>{pct.toFixed(1)}%</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    onClick={() => setEditingSubjectId(isEditing ? null : sub.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    <span className="material-symbols-rounded text-[18px]">{isEditing ? 'done' : 'edit'}</span>
                                                </button>
                                                {isEditing && (
                                                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                                                        <span className="material-symbols-rounded text-[18px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Strip */}
                                    <div className="relative py-2">
                                        <div className="h-1.5 w-full bg-[#2a2a2e] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${s.bg} transition-all duration-500`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                                            <span>{sub.attended} Present</span>
                                            <span>{sub.total - sub.attended} Absent</span>
                                        </div>
                                    </div>

                                    {/* Smart Bunk Info */}
                                    <div className={`py-3 px-4 rounded-xl ${s.light} text-xs font-semibold ${s.text} flex items-center gap-2`}>
                                        <span className="material-symbols-rounded text-[16px]">
                                            {pct < targetPct ? 'menu_book' : 'bed'}
                                        </span>
                                        {pct < targetPct ? (
                                            <>Attend {classesToReachTarget(sub.attended, sub.total, targetPct)} more classes</>
                                        ) : (
                                            <>Can skip {classesCanSkip(sub.attended, sub.total, targetPct)} classes</>
                                        )}
                                    </div>

                                    {/* Action Buttons or Edit Controls */}
                                    <div className="pt-2">
                                        {isEditing ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <EditInput label="Present" value={sub.attended} onChange={v => handleEdit(sub.id, 'attended', v)} />
                                                <EditInput label="Total" value={sub.total} onChange={v => handleEdit(sub.id, 'total', v)} />
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <ActionButton
                                                    icon="check" label="Present" color="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white"
                                                    onClick={() => handleMark(sub.id, true)}
                                                />
                                                <ActionButton
                                                    icon="close" label="Absent" color="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white"
                                                    onClick={() => handleMark(sub.id, false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showAddModal && <AddModal onAdd={s => { updateAttendance([...subjects, { ...s, id: Date.now().toString() }]); setShowAddModal(false); }} onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

// ── UI Components ────────────────────────────────────

const StatBox = ({ icon, label, value, color }) => (
    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 group hover:border-[var(--color-primary)]/30 transition-colors">
        <span className={`material-symbols-rounded ${color} mb-1 opacity-80`}>{icon}</span>
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-display">{label}</div>
    </div>
);

const ActionButton = ({ icon, label, color, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all duration-200 border border-white/5 active:scale-95 ${color}`}
    >
        <span className="material-symbols-rounded text-[18px]">{icon}</span>
        {label}
    </button>
);

const EditInput = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">{label}</span>
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
    </div>
);

const AddModal = ({ onAdd, onClose }) => {
    const [form, setForm] = useState({ code: '', name: '', attended: '', total: '' });
    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#18181b] w-full max-w-md rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl animate-slide-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-white">New Subject</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><span className="material-symbols-rounded">close</span></button>
                </div>
                <div className="space-y-4">
                    <input autoFocus placeholder="Course Code (e.g. 21CSC...)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:border-[var(--color-primary)] focus:outline-none" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                    <input placeholder="Subject Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:border-[var(--color-primary)] focus:outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Attended" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:border-[var(--color-primary)] focus:outline-none" value={form.attended} onChange={e => setForm({ ...form, attended: e.target.value })} />
                        <input type="number" placeholder="Total" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:border-[var(--color-primary)] focus:outline-none" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} />
                    </div>
                </div>
                <button
                    onClick={() => onAdd({ ...form, attended: Number(form.attended) || 0, total: Number(form.total) || 0 })}
                    className="w-full py-4 bg-[var(--color-primary)] rounded-2xl text-white font-black hover:opacity-90 transition-opacity"
                >
                    Add Subject
                </button>
            </div>
        </div>
    );
};

export default Attendance;
