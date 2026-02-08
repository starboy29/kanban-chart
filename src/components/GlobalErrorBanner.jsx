import React from 'react';
import { useTasks } from '../context/TasksContext';

const GlobalErrorBanner = () => {
    const { error } = useTasks();

    if (!error) return null;

    // Check for specific permission error
    const isPermissionError = error.includes("Missing or insufficient permissions");

    return (
        <div className="bg-red-500/10 border-b border-red-500/20 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
                <span className="material-symbols-rounded">error</span>
                <span className="font-bold">Database Error</span>
            </div>
            <p className="text-sm text-red-400">
                {isPermissionError
                    ? "Access denied. Please update your Firestore Security Rules to allow public access (or setup auth)."
                    : error}
            </p>
            {isPermissionError && (
                <p className="text-xs text-red-400/70 mt-1">
                    Go to Firebase Console &gt; Firestore &gt; Rules &gt; Change to "allow read, write: if true;"
                </p>
            )}
        </div>
    );
};

export default GlobalErrorBanner;
