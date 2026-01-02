import { useMemo } from "react";
import { useTaskBoardViewModel } from "@/features/tasks/view-models/useTaskBoardViewModel";
import { CreateTaskDialog } from "@/features/tasks/components/CreateTaskDialog";
import { TaskList } from "@/features/tasks/components/TaskList";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { LocalStorageTaskRepository } from "@/features/tasks/repositories/LocalStorageTaskRepository";

export const TaskBoardPage = () => {
    // 0. DI Layer: Inject Repository
    const repository = useMemo(() => new LocalStorageTaskRepository(), []);

    // 1. Logic Layer: ViewModel
    // The page is responsible for fetching data and handling view-level interactions
    const {
        columns,
        isLoading,
        filters,
        setFilter,
        moveTask,
        updateProgress,
        createTask,
        viewMode,
        setViewMode
    } = useTaskBoardViewModel(repository);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-muted-foreground animate-pulse">
                Loading workspace...
            </div>
        );
    }

    // 2. Composition Layer
    // The page composes the layout and passes data down to dumb components
    return (
        <div className="flex flex-col gap-8 min-h-[calc(100vh-4rem)] pb-8">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                    <p className="text-muted-foreground">Manage project progress and track team workload.</p>
                </div>

                <div className="flex items-center gap-2">
                    <TaskFilters
                        filters={filters}
                        onUpdate={setFilter}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    {/* Create Dialog */}
                    <CreateTaskDialog onCreate={createTask} />
                </div>
            </div>

            {/* Smart Component Handoff */}
            {/* We pass the formatted 'columns' to the list view */}
            <div className="flex-1">
                <TaskList
                    columns={columns}
                    onProgressUpdate={updateProgress}
                    onTaskMove={moveTask}
                    viewMode={viewMode}
                />
            </div>
        </div>
    );
};
