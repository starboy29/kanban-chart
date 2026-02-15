import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, syncAllTasks } from '../services/googleCalendarService';

const TasksContext = createContext();

export const useTasks = () => useContext(TasksContext);

export const TasksProvider = ({ children }) => {
    const { user, loading: authLoading, googleAccessToken } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('board');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [columns, setColumns] = useState([
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ]);
    const [error, setError] = useState(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Google Calendar sync state
    const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
    const [calendarSyncing, setCalendarSyncing] = useState(false);

    // Attendance data
    const [attendanceData, setAttendanceData] = useState([]);

    // Filtered / Current Subjects & Tags
    const [subjects, setSubjects] = useState([]);
    const [tags, setTags] = useState([]);

    // Fetch Settings (Subjects & Tags + Calendar Sync) from Firestore
    useEffect(() => {
        if (!user) {
            setSettingsLoading(false);
            return;
        }
        if (authLoading) return;

        setSettingsLoading(true);
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');

        const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                setSubjects(docSnap.data().subjects || []);
                setTags(docSnap.data().tags || []);
                setCalendarSyncEnabled(docSnap.data().calendarSyncEnabled || false);
                setAttendanceData(docSnap.data().attendanceData || []);
                setIsNewUser(false);
            } else {
                setSubjects([]);
                setTags([]);
                setCalendarSyncEnabled(false);
                setAttendanceData([]);
                setIsNewUser(true);
            }
            setSettingsLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
            setSettingsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    // Real-time synchronization with Firestore
    useEffect(() => {
        if (!user || authLoading) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const q = query(
                collection(db, "tasks"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const tasksData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const safeTasks = tasksData.map(t => ({
                    ...t,
                    date: t.date || 'No Date'
                }));
                setTasks(safeTasks);
                setLoading(false);
                setError(null);
            }, (err) => {
                console.error("Error fetching tasks: ", err);
                setError(err.message);
                setLoading(false);
                if (tasks.length === 0 && err.code !== 'permission-denied') {
                    setTasks([
                        { id: '1', title: 'Lab Report: Thermodynamics', status: 'todo', subject: 'Physics', date: '23:59 PM', isUrgent: true, source: 'telegram' },
                        { id: '2', title: 'Calculus Quiz Prep - Chapter 4', status: 'todo', subject: 'Math', date: '14:00 PM', isUrgent: true, source: 'whatsapp' },
                        { id: '3', title: 'Read "To Kill a Mockingbird" Ch. 1-5', status: 'todo', subject: 'Literature', date: 'Tomorrow' },
                    ]);
                }
            });
            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [user, authLoading]);

    const addTask = async (newTask) => {
        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                ...newTask,
                userId: user.uid,
                status: 'todo',
                createdAt: serverTimestamp()
            });

            // Auto-sync to Google Calendar
            if (calendarSyncEnabled && googleAccessToken) {
                const eventId = await createCalendarEvent(googleAccessToken, { ...newTask, id: docRef.id });
                if (eventId) {
                    await updateDoc(docRef, { googleEventId: eventId });
                }
            }
        } catch (err) {
            console.error("Error adding task: ", err);
            setTasks(prev => [{ ...newTask, id: Date.now().toString(), status: 'todo' }, ...prev]);
        }
    };

    const updateTask = async (taskId, updates) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

        try {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, updates);

            // Auto-sync to Google Calendar
            if (calendarSyncEnabled && googleAccessToken) {
                const task = tasks.find(t => t.id === taskId);
                if (task?.googleEventId) {
                    await updateCalendarEvent(googleAccessToken, task.googleEventId, { ...task, ...updates });
                }
            }
        } catch (err) {
            console.error("Error updating task: ", err);
        }
    };

    const moveTask = async (taskId, newStatus) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, { status: newStatus });

            // Auto-sync status change to Google Calendar
            if (calendarSyncEnabled && googleAccessToken) {
                const task = tasks.find(t => t.id === taskId);
                if (task?.googleEventId) {
                    await updateCalendarEvent(googleAccessToken, task.googleEventId, { ...task, status: newStatus });
                }
            }
        } catch (err) {
            console.error("Error moving task: ", err);
        }
    };

    const deleteTask = async (taskId) => {
        // Get task before removing (for calendar event deletion)
        const task = tasks.find(t => t.id === taskId);

        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await deleteDoc(doc(db, "tasks", taskId));

            // Auto-delete from Google Calendar
            if (calendarSyncEnabled && googleAccessToken && task?.googleEventId) {
                await deleteCalendarEvent(googleAccessToken, task.googleEventId);
            }
        } catch (err) {
            console.error("Error deleting task: ", err);
        }
    };

    const renameColumn = (columnId, newTitle) => {
        setColumns(prev => prev.map(col =>
            col.id === columnId ? { ...col, title: newTitle } : col
        ));
    };

    const syncSubjects = async (newSubjects) => {
        try {
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
            await setDoc(settingsRef, { subjects: newSubjects }, { merge: true });
        } catch (err) {
            console.error("Error syncing subjects:", err);
        }
    };

    const addSubject = (newSubject) => {
        if (!subjects.includes(newSubject)) {
            const updated = [...subjects, newSubject];
            setSubjects(updated);
            syncSubjects(updated);
        }
    };

    const deleteSubject = (subjectToDelete) => {
        const updated = subjects.filter(s => s !== subjectToDelete);
        setSubjects(updated);
        syncSubjects(updated);
    };

    // Tag Management
    const syncTags = async (newTags) => {
        try {
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
            await setDoc(settingsRef, { tags: newTags }, { merge: true });
        } catch (err) {
            console.error("Error syncing tags:", err);
        }
    };

    const addTag = (newTag) => {
        if (!tags.includes(newTag)) {
            const updated = [...tags, newTag];
            setTags(updated);
            syncTags(updated);
        }
    };

    const deleteTag = (tagToDelete) => {
        const updated = tags.filter(t => t !== tagToDelete);
        setTags(updated);
        syncTags(updated);
    };

    const updateTag = async (oldTag, newTag) => {
        if (tags.includes(oldTag) && !tags.includes(newTag)) {
            const updated = tags.map(t => t === oldTag ? newTag : t);
            setTags(updated);
            syncTags(updated);

            setTasks(prev => prev.map(t => {
                if (t.tags && t.tags.includes(oldTag)) {
                    return { ...t, tags: t.tags.map(tag => tag === oldTag ? newTag : tag) };
                }
                return t;
            }));
        }
    };

    const updateSubject = async (oldSubject, newSubject) => {
        if (subjects.includes(oldSubject) && !subjects.includes(newSubject)) {
            const updated = subjects.map(s => s === oldSubject ? newSubject : s);
            setSubjects(updated);
            syncSubjects(updated);
            setTasks(prev => prev.map(t => t.subject === oldSubject ? { ...t, subject: newSubject } : t));
        }
    };

    // Attendance controls
    const updateAttendance = async (updatedData) => {
        setAttendanceData(updatedData);
        if (user) {
            try {
                const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
                await setDoc(settingsRef, { attendanceData: updatedData }, { merge: true });
            } catch (err) {
                console.error("Error saving attendance:", err);
            }
        }
    };

    // Google Calendar sync controls
    const toggleCalendarSync = async (enabled) => {
        setCalendarSyncEnabled(enabled);
        try {
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
            await setDoc(settingsRef, { calendarSyncEnabled: enabled }, { merge: true });
        } catch (err) {
            console.error("Error saving calendar sync setting:", err);
        }
    };

    const syncAllToCalendar = async () => {
        if (!googleAccessToken) {
            console.warn('[GCal] No access token for full sync');
            return;
        }

        setCalendarSyncing(true);
        try {
            const results = await syncAllTasks(googleAccessToken, tasks);

            // Store googleEventIds on tasks in Firestore
            for (const [taskId, eventId] of Object.entries(results)) {
                const task = tasks.find(t => t.id === taskId);
                if (task && !task.googleEventId) {
                    try {
                        const taskRef = doc(db, "tasks", taskId);
                        await updateDoc(taskRef, { googleEventId: eventId });
                    } catch (err) {
                        console.error(`Error storing eventId for task ${taskId}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error("Error during full calendar sync:", err);
        }
        setCalendarSyncing(false);
    };

    const filteredTasks = tasks
        .filter(task => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.subject.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = filterPriority === 'all' || (filterPriority === 'urgent' && task.isUrgent);
            return matchesSearch && matchesPriority;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            }
            if (sortBy === 'oldest') {
                return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
            }
            if (sortBy === 'dueAsc') {
                return (a.date || '').localeCompare(b.date || '');
            }
            return 0;
        });

    return (
        <TasksContext.Provider value={{
            tasks: filteredTasks,
            columns,
            addTask,
            moveTask,
            updateTask,
            deleteTask,
            renameColumn,
            subjects,
            addSubject,
            deleteSubject,
            updateSubject,
            tags,
            addTag,
            deleteTag,
            updateTag,
            searchQuery,
            setSearchQuery,
            loading,
            viewMode,
            setViewMode,
            filterPriority,
            setFilterPriority,
            sortBy,
            setSortBy,
            error,
            isNewUser,
            settingsLoading,
            // Google Calendar sync
            calendarSyncEnabled,
            toggleCalendarSync,
            syncAllToCalendar,
            calendarSyncing,
            // Attendance
            attendanceData,
            updateAttendance,
        }}>
            {children}
        </TasksContext.Provider>
    );
};
