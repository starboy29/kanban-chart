import React, { useState } from 'react';
import Column from './Column';
import { useTasks } from '../context/TasksContext';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import ListView from './ListView';

import TaskDetailModal from './TaskDetailModal';

const KanbanBoard = ({ onNewTask, filterSubject }) => {
    const { tasks, moveTask, viewMode, columns: contextColumns } = useTasks();
    const [activeId, setActiveId] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id;
        const overId = over.id;

        // Find the task being dragged
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Determine new status
        let newStatus = task.status;

        // Dropped onto a column
        if (['todo', 'inprogress', 'done'].includes(overId)) {
            newStatus = overId;
        }
        // Dropped onto another task
        else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (task.status !== newStatus) {
            moveTask(taskId, newStatus);
        }

        setActiveId(null);
    };

    const filteredTasks = filterSubject
        ? tasks.filter(t => t.subject.toLowerCase() === filterSubject.toLowerCase())
        : tasks;

    if (viewMode === 'list') {
        return <ListView tasks={filteredTasks} />;
    }

    const columns = contextColumns.map(col => ({
        ...col,
        count: filteredTasks.filter(t => t.status === col.id).length
    }));

    const activeTask = tasks.find(t => t.id === activeId);

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 h-full overflow-x-auto overflow-y-hidden">
                    <div className="h-full flex gap-6 min-w-[1000px]">
                        {columns.map(col => (
                            <Column
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                status={col.id}
                                count={col.count}
                                tasks={filteredTasks.filter(t => t.status === col.id)}
                                onNewTask={onNewTask}
                                onTaskClick={setEditingTask}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {editingTask && (
                <TaskDetailModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    mode="edit"
                />
            )}
        </>
    );
};

export default KanbanBoard;
