import { useTaskBoardViewModel } from "@/features/tasks/view-models/useTaskBoardViewModel";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

export const TasksPage = () => {
    // 1. Logic Layer (ViewModel)
    const { columns, isLoading } = useTaskBoardViewModel();

    if (isLoading) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard...</div>;
    }

    // 2. Presentation Layer
    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-8rem)]">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                    <p className="text-muted-foreground mt-1">Manage project progress and track team workload.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filter
                    </button>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow">
                        <Plus className="mr-1 h-4 w-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <TaskBoard columns={columns} />
        </div>
    );
};
