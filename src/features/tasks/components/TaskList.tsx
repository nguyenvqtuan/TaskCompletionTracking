import { Task, TaskStatus } from "@/features/tasks/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
    columns: Record<string, Task[]>;
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
    onProgressUpdate?: (taskId: string, progress: number) => void;
}

const COLUMN_TITLES: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
};

import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils/cn";

import { ViewMode } from "../view-models/useTaskBoardViewModel";

interface TaskListProps {
    columns: Record<string, Task[]>;
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
    viewMode?: ViewMode;
}

// Helper for status colors
function getStatusColor(status: string) {
    switch (status) {
        case 'todo': return 'bg-slate-400';
        case 'in_progress': return 'bg-blue-400';
        case 'review': return 'bg-amber-400';
        case 'done': return 'bg-emerald-400';
        default: return 'bg-slate-400';
    }
}

export function TaskList({ columns, onTaskMove, viewMode = 'grid' }: TaskListProps) {
    // ... existing dnd logic ...
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid accidental drags
            },
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.task) {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => { };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const task = active.data.current?.task as Task;

        let newStatus = over.id as TaskStatus;

        // If dropped on a task, find that task's status
        const overTask = Object.values(columns).flat().find(t => t.id === over.id);
        if (overTask) {
            newStatus = overTask.status;
        }

        if (task && newStatus && task.status !== newStatus && COLUMN_TITLES[newStatus]) {
            onTaskMove(taskId, newStatus);
        }

        setActiveTask(null);
    };

    if (viewMode === 'list') {
        const allTasks = Object.values(columns).flat();
        // Simplified List View - No Drag and Drop currently for list view
        // or we could wrap it in DndContext if we wanted sorting, but let's keep it simple "Table-like"
        return (
            <div className="flex flex-col gap-3">
                {allTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">No tasks found</div>
                ) : (
                    allTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 bg-muted/5 border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                            <div className={cn("w-3 h-3 rounded-full flex-shrink-0", getStatusColor(task.status))} />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{task.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                                <span className={cn("px-2 py-0.5 rounded-full border bg-background capitalize",
                                    task.priority === 'high' ? "text-red-700 border-red-200 bg-red-100" :
                                        task.priority === 'medium' ? "text-orange-700 border-orange-200 bg-orange-100" : "text-slate-600 border-slate-200 bg-slate-100"
                                )}>
                                    {task.priority}
                                </span>
                                <span>{COLUMN_TITLES[task.status]}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                {Object.entries(columns).map(([status, tasks]) => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={tasks}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-80 rotate-2 cursor-grabbing">
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

// Sub-component for dropping area
import { useDroppable } from "@dnd-kit/core";

function TaskColumn({ status, tasks }: { status: string, tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col gap-4 min-h-[500px] min-w-0 bg-muted/5 rounded-xl p-2 outline-none"
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-1">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
                    {COLUMN_TITLES[status]}
                </h2>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md font-medium border">
                    {tasks.length}
                </span>
            </div>

            {/* 
              SCROLL FIX:
              - h-full min-h-0 flex-1: allows container to fill space but shrink if needed.
              - overflow-y-auto: enables internal scroll.
              - Removed scrollbar-hide to allow users to see they can scroll.
          */}
            <div className="flex flex-col gap-3 px-1">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-muted/50 rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground gap-2 bg-muted/5">
                        <span className="opacity-50 font-medium">No tasks</span>
                        <span className="opacity-30 text-[10px]">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    );
    function getStatusColor(status: string) {
        switch (status) {
            case 'todo': return 'bg-slate-400';
            case 'in_progress': return 'bg-blue-400';
            case 'review': return 'bg-amber-400';
            case 'done': return 'bg-emerald-400';
            default: return 'bg-slate-400';
        }
    }
}
