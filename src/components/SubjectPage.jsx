import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from './KanbanBoard';
import { useTasks } from '../context/TasksContext';

const SubjectPage = ({ onNewTask }) => {
    const { subjectName } = useParams();
    // Capitalize first letter for display if needed, but the filtering should be case-insensitive or exact
    const formattedSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-rounded text-purple-400">school</span>
                {formattedSubject}
            </h2>
            <div className="flex-1 overflow-hidden -mx-8 px-8">
                <KanbanBoard onNewTask={onNewTask} filterSubject={formattedSubject} />
            </div>
        </div>
    );
};

export default SubjectPage;
