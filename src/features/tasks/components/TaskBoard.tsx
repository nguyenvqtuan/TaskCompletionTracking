import { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
    columns: Record<string, Task[]>;
}

const COLUMN_TITLES: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
};

export function TaskBoard({ columns }: TaskBoardProps) {
    return (
        <div className="flex h-full gap-6 overflow-x-auto pb-4">
            {Object.entries(columns).map(([status, tasks]) => (
                <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            {COLUMN_TITLES[status]}
                        </h2>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                            {tasks.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        {tasks.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-muted rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
