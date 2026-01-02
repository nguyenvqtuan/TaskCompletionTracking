import { useState, useCallback, useMemo, useEffect } from "react";
import { Task, TaskStatus, TaskFilters, TaskPriority } from "@/features/tasks/types";
import { useTaskDependencies } from "@/app/context/TaskDependenciesContext";

// View Mode type
export type ViewMode = "grid" | "list";

export function useTaskBoardViewModel() {
  const {
    getTasks,
    createTask: createTaskUseCase,
    updateTask: updateTaskUseCase,
    deleteTask: deleteTaskUseCase,
    calculateProgress,
  } = useTaskDependencies();

  // 1. Core State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
  });

  // Initial Load
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks.execute();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [getTasks]);

  /**
   * Updates a task's progress and automatically transitions status
   */
  const updateProgress = useCallback(
    async (taskId: string, newProgress: number) => {
      const clampedProgress = Math.min(100, Math.max(0, newProgress));

      // Find task to update (for optimistic rollback)
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      // Calculate new Status logic (duplicated from CalculateProgress potentially, or local rule)
      // Ideally we should use a Domain Service or Use Case for this specific logic if it's complex.
      // For now, we keep the auto-status logic here as it's UI-specific "smart" behavior.
      let newStatus = taskToUpdate.status;
      if (clampedProgress === 100) newStatus = TaskStatus.DONE;
      else if (clampedProgress === 0) newStatus = TaskStatus.TODO;
      else if (taskToUpdate.status === TaskStatus.TODO || taskToUpdate.status === TaskStatus.DONE) {
        newStatus = TaskStatus.IN_PROGRESS;
      }

      // Optimistic Update
      const optimisticTask = Task.reconstitute(taskToUpdate.toJSON());
      optimisticTask.setProgress(clampedProgress);
      if (newStatus !== optimisticTask.status) optimisticTask.changeStatus(newStatus);

      setTasks((prev) => prev.map((t) => (t.id === taskId ? optimisticTask : t)));

      try {
        await updateTaskUseCase.execute({
          id: taskId,
          progress: clampedProgress,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update task progress", error);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? taskToUpdate : t)));
      }
    },
    [tasks, updateTaskUseCase],
  );

  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      console.log("ViewModel moveTask called:", taskId, newStatus);
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      // 1. Calculate new progress
      const newProgress = calculateProgress.execute(newStatus);

      // 2. Optimistic Update
      const optimisticTask = Task.reconstitute(taskToUpdate.toJSON());
      optimisticTask.changeStatus(newStatus);
      optimisticTask.setProgress(newProgress);

      setTasks((prev) => prev.map((t) => (t.id === taskId ? optimisticTask : t)));

      try {
        // 3. Persist
        await updateTaskUseCase.execute({
          id: taskId,
          status: newStatus,
          progress: newProgress,
        });
      } catch (error) {
        console.error("Failed to move task", error);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? taskToUpdate : t)));
      }
    },
    [tasks, calculateProgress, updateTaskUseCase],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const previousTasks = [...tasks];
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      try {
        // Note: Assuming Admin check is done in Use Case or ignored here if not strictly required for Board (or we should handle error)
        // If we want to support RBAC on Board, we need to handle the error processing.
        await deleteTaskUseCase.execute(taskId); // We might need to pass user here if RBAC enabled!
      } catch (error) {
        console.error("Failed to delete task", error);
        alert("Failed to delete: " + (error as Error).message); // Simple feedback
        setTasks(previousTasks);
      }
    },
    [tasks, deleteTaskUseCase],
  );

  const createTask = useCallback(
    async (newTaskProps: { title: string; description: string; priority: TaskPriority; dueDate?: Date | null }) => {
      try {
        const newTask = await createTaskUseCase.execute({
          title: newTaskProps.title,
          description: newTaskProps.description,
          priority: newTaskProps.priority,
          dueDate: newTaskProps.dueDate,
        });
        setTasks((prev) => [newTask, ...prev]);
      } catch (error) {
        console.error("Failed to create task", error);
      }
    },
    [createTaskUseCase],
  );

  const updateFilter = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // 3. Derived State: Apply filters & Search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status Filter
      if (filters.status !== "all" && task.status !== filters.status) return false;
      // Priority Filter
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      // Search Filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // Grouping for Kanban Board
  const columns = useMemo(
    () => ({
      [TaskStatus.TODO]: filteredTasks.filter((t) => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.REVIEW]: filteredTasks.filter((t) => t.status === TaskStatus.REVIEW),
      [TaskStatus.DONE]: filteredTasks.filter((t) => t.status === TaskStatus.DONE),
    }),
    [filteredTasks],
  );

  return {
    // Data
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    columns,

    // State
    isLoading,
    filters,
    viewMode,

    // Actions
    updateProgress,
    moveTask,
    deleteTask,
    createTask,
    setFilter: updateFilter,
    setViewMode,
  };
}
