import { useState } from "react";
import { createPortal } from "react-dom";
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
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/shared/utils/cn";
import { Task } from "@/domain/entities/Task";
import { TaskStatus } from "@/domain/enums/TaskStatus";
import { TaskItem } from "./TaskItem";
import { SortableTaskItem } from "./SortableTaskItem";

export type ViewMode = "grid" | "list";

interface TaskListProps {
  columns: Record<string, Task[]>;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onProgressUpdate?: (taskId: string, progress: number) => void;
  viewMode?: ViewMode;
}

const COLUMN_TITLES: Record<string, string> = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.REVIEW]: "In Review",
  [TaskStatus.DONE]: "Done",
};

function getStatusColor(status: string) {
  switch (status) {
    case TaskStatus.TODO:
      return "bg-slate-400";
    case TaskStatus.IN_PROGRESS:
      return "bg-blue-400";
    case TaskStatus.REVIEW:
      return "bg-amber-400";
    case TaskStatus.DONE:
      return "bg-emerald-400";
    default:
      return "bg-slate-400";
  }
}

export function TaskList({ columns, onTaskMove, viewMode = "grid" }: TaskListProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.task) {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (_event: DragOverEvent) => {};

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log("Drag ended with no over target");
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const task = active.data.current?.task as Task;

    let newStatus = over.id as TaskStatus;

    console.log("DragEnd:", { taskId, overId: over.id, currentStatus: task?.status });

    if (!Object.values(TaskStatus).includes(newStatus as TaskStatus)) {
      const overTask = Object.values(columns)
        .flat()
        .find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
        console.log("Dropped on task, resolved status:", newStatus);
      } else {
        console.warn("Dropped on unknown target:", over.id);
      }
    } else {
      console.log("Dropped on column:", newStatus);
    }

    if (task && newStatus && task.status !== newStatus) {
      console.log("Moving task", taskId, "to", newStatus);
      onTaskMove(taskId, newStatus);
    }

    setActiveTask(null);
  };

  if (viewMode === "list") {
    const allTasks = Object.values(columns).flat();
    return (
      <div className="flex flex-col gap-3">
        {allTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">No tasks found</div>
        ) : (
          allTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 bg-muted/5 border rounded-lg p-3 hover:bg-muted/10 transition-colors"
            >
              <div className={cn("w-3 h-3 rounded-full flex-shrink-0", getStatusColor(task.status))} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{task.title}</h4>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full border bg-background capitalize",
                    task.priority === "high"
                      ? "text-red-700 border-red-200 bg-red-100"
                      : task.priority === "medium"
                        ? "text-orange-700 border-orange-200 bg-orange-100"
                        : "text-slate-600 border-slate-200 bg-slate-100",
                  )}
                >
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
          <TaskColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2 cursor-grabbing">
              <TaskItem task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

function TaskColumn({ status, tasks }: { status: string; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className="flex flex-col gap-4 min-h-[500px] min-w-0 bg-muted/5 rounded-xl p-2 outline-none">
      <div className="flex items-center justify-between p-1">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", getStatusColor(status))} />
          {COLUMN_TITLES[status] || status}
        </h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md font-medium border">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} />
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
}
