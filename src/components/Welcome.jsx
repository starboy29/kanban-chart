import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Welcome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [subjects, setSubjects] = useState([
        'Physics', 'Math', 'Literature', 'Biology', 'History',
        'Computer Science', 'Art History', 'Personal'
    ]);
    const [newSubject, setNewSubject] = useState('');
    const [tags, setTags] = useState(['Urgent', 'Exam', 'Lab', 'Read', 'To Buy']);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
            setSubjects([...subjects, newSubject.trim()]);
            setNewSubject('');
        }
    };

    const removeSubject = (sub) => {
        setSubjects(subjects.filter(s => s !== sub));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (t) => {
        setTags(tags.filter(tag => tag !== t));
    };

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Save subjects and tags to user settings
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
            await setDoc(settingsRef, {
                subjects: subjects,
                tags: tags,
                setupComplete: true
            }, { merge: true });

            navigate('/');
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background-dark)] flex flex-col items-center justify-center p-4 text-white">
            <div className="max-w-2xl w-full bg-[#18181b] rounded-2xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to your Kanban Board! 👋</h1>
                    <p className="text-gray-400">Let's set up your workspace.</p>
                </div>

                {/* Subjects Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-[var(--color-primary)]">library_books</span>
                        Customize Subjects
                    </h2>

                    <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="Add a subject (e.g., 'Chemistry')"
                            className="flex-1 bg-[var(--color-background-dark)] border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Add
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar mb-2">
                        {subjects.map(sub => (
                            <div key={sub} className="flex items-center gap-2 bg-[#27272a] px-3 py-1.5 rounded-full border border-white/5 group">
                                <span className="text-sm">{sub}</span>
                                <button
                                    onClick={() => removeSubject(sub)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-rounded text-[16px]">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags Section */}
                <div className="mb-8 pt-6 border-t border-white/5">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-[var(--color-primary)]">label</span>
                        Customize Tags
                    </h2>

                    <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag (e.g., 'Project')"
                            className="flex-1 bg-[var(--color-background-dark)] border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Add
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {tags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 bg-[#27272a] px-3 py-1.5 rounded-full border border-white/5 group">
                                <span className="text-sm">#{tag}</span>
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-rounded text-[16px]">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Setting up...' : 'Get Started'}
                    {!loading && <span className="material-symbols-rounded">arrow_forward</span>}
                </button>
            </div>
        </div>
    );
};

export default Welcome;
