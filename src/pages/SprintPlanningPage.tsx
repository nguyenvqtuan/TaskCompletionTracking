import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import { Task } from "@/domain/entities/Task";
import { TaskPriority } from "@/domain/enums/TaskPriority";
import { TaskStatus } from "@/domain/enums/TaskStatus";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Plus, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { CustomSelect } from "@/shared/components/ui/select-custom";

export function SprintPlanningPage() {
  const { tasks, updateTask } = useTasks();
  const { sprints, createSprint } = useSprints();

  // UI State
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

  // Derived State
  const backlogTasks = useMemo(() => tasks.filter((t) => !t.sprintId), [tasks]);
  const sprintTasks = useMemo(
    () => (selectedSprintId ? tasks.filter((t) => t.sprintId === selectedSprintId) : []),
    [tasks, selectedSprintId],
  );
  const currentSprint = sprints.find((s) => s.id === selectedSprintId);

  // Handlers
  const handleCreateSprint = async () => {
    if (!newSprintName.trim()) return;
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 14); // 2 week default

      const sprint = await createSprint({
        name: newSprintName,
        startDate: today,
        endDate: nextWeek,
      });
      setNewSprintName("");
      setIsCreatingSprint(false);
      setSelectedSprintId(sprint.id); // Auto select
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveDragTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const containerId = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Logic: 'backlog' container vs 'sprint' container
    if (containerId === "backlog" && task.sprintId) {
      // Unassign
      await updateTask({ id: taskId, sprintId: null });
    } else if (containerId === "sprint" && selectedSprintId && task.sprintId !== selectedSprintId) {
      // Assign to current sprint
      await updateTask({ id: taskId, sprintId: selectedSprintId });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6 border-b mb-6">
        <div className="flex items-start gap-4">
          <Button variant="outline" asChild className="mt-1">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Board
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sprint Planning</h1>
            <p className="text-muted-foreground mt-1">Organize backlog items and plan upcoming sprints.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <CustomSelect
              value={selectedSprintId || ""}
              onChange={(val) => setSelectedSprintId(val === "all" ? null : val)}
              options={sprints.map((s) => ({
                value: s.id,
                label: s.name,
                icon:
                  s.status === "ACTIVE" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Calendar className="w-4 h-4 text-slate-400" />
                  ),
                className:
                  s.status === "ACTIVE"
                    ? "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20"
                    : "",
              }))}
              placeholder="Select a Sprint to Plan..."
              includeAllOption={false}
              className="h-11"
            />
          </div>
          <Button onClick={() => setIsCreatingSprint(!isCreatingSprint)} className="h-11 px-6 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Sprint
          </Button>
        </div>
      </div>

      {isCreatingSprint && (
        <div className="p-4 border rounded-md bg-muted/40 flex gap-2 items-center">
          <Input
            placeholder="Sprint Name (e.g. Sprint 10)"
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
          />
          <Button onClick={handleCreateSprint}>Create</Button>
        </div>
      )}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          {/* Backlog Column */}
          <div className="flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border p-4">
            <h2 className="font-semibold mb-4 flex items-center justify-between">
              Backlog
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {backlogTasks.length}
              </span>
            </h2>
            <DroppableArea id="backlog" className="flex-1 overflow-y-auto min-h-[200px]">
              <div className="grid grid-cols-2 gap-3 pb-4">
                {backlogTasks.map((task) => (
                  <DraggableTask key={task.id} task={task} />
                ))}
              </div>
              {backlogTasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 col-span-2">Backlog is empty</div>
              )}
            </DroppableArea>
          </div>

          {/* Sprint Column */}
          <div className="flex flex-col bg-orange-50/50 dark:bg-orange-950/10 rounded-xl border border-orange-100 dark:border-orange-900 p-4">
            <h2 className="font-semibold mb-4 flex items-center justify-between text-orange-900 dark:text-orange-100">
              {currentSprint ? currentSprint.name : "Select a Sprint"}
              {currentSprint && (
                <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  {sprintTasks.length}
                </span>
              )}
            </h2>

            {currentSprint ? (
              <DroppableArea id="sprint" className="flex-1 overflow-y-auto min-h-[200px]">
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {sprintTasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </div>
                {sprintTasks.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8 col-span-2">Drag tasks here</div>
                )}
              </DroppableArea>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select or create a sprint to plan
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeDragTask ? (
            <div className="opacity-80 rotate-2 w-[280px]">
              <CompactTaskItem task={activeDragTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Helper Components for DnD
function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="opacity-50 grayscale">
        <CompactTaskItem task={task} />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <CompactTaskItem task={task} />
    </div>
  );
}

function CompactTaskItem({ task }: { task: Task }) {
  const PRIORITY_COLORS = {
    [TaskPriority.LOW]: "border-l-slate-400 hover:border-l-slate-500",
    [TaskPriority.MEDIUM]: "border-l-orange-400 hover:border-l-orange-500",
    [TaskPriority.HIGH]: "border-l-red-500 hover:border-l-red-600",
  };

  return (
    <div
      className={`bg-card group border rounded-r-md border-l-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing p-3 flex flex-col gap-1.5 h-full ${PRIORITY_COLORS[task.priority] || "border-l-slate-200"}`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
          {task.sprintId ? "TSK" : "BKL"}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
            task.status === TaskStatus.DONE
              ? "bg-green-100 text-green-700 border-green-200"
              : task.status === TaskStatus.IN_PROGRESS
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
      </div>

      <p className="text-sm font-medium leading-snug text-foreground/90 group-hover:text-primary transition-colors">
        {task.title}
      </p>

      <div className="mt-auto pt-2 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-background flex items-center justify-center text-[8px] font-bold text-slate-600">
            U
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{task.priority.toUpperCase()}</span>
      </div>
    </div>
  );
}

function DroppableArea({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "bg-accent/10 ring-2 ring-primary/20" : ""} transition-all rounded-lg`}
    >
      {children}
    </div>
  );
}
