import { useState, useCallback, useMemo, useEffect } from "react";
import { Task, TaskStatus, TaskFilters, TaskPriority } from "@/features/tasks/types";
import { TaskRepository } from "@/features/tasks/repositories/TaskRepository";

// View Mode type
export type ViewMode = "grid" | "list";

export function useTaskBoardViewModel(repository: TaskRepository) {
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
        const data = await repository.getAll();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [repository]);

  /**
   * Updates a task's progress and automatically transitions status
   */
  const updateProgress = useCallback(
    async (taskId: string, newProgress: number) => {
      const clampedProgress = Math.min(100, Math.max(0, newProgress));

      // Find task to update
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      // Clone to avoid mutating state directly -> React needs new reference
      const updatedTask = Task.reconstitute(taskToUpdate.toJSON());

      let newStatus = updatedTask.status;

      // Auto-status logic
      if (clampedProgress === 100) {
        newStatus = TaskStatus.DONE;
      } else if (clampedProgress === 0) {
        newStatus = TaskStatus.TODO;
      } else if (updatedTask.status === TaskStatus.TODO || updatedTask.status === TaskStatus.DONE) {
        newStatus = TaskStatus.IN_PROGRESS;
      }

      try {
        // Apply updates to the entity
        updatedTask.setProgress(clampedProgress);
        if (newStatus !== updatedTask.status) {
          updatedTask.changeStatus(newStatus);
        }

        // Optimistic Update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

        // Persist
        await repository.update(updatedTask);
      } catch (error) {
        console.error("Failed to update task progress", error);
        // Revert logic would go here
        // For now we rely on next fetch or simple ignore,
        // but strictly we should revert 'tasks' state locally.
        setTasks((prev) => prev.map((t) => (t.id === taskId ? taskToUpdate : t)));
      }
    },
    [tasks, repository],
  );

  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const STATUS_PROGRESS_MAP: Record<TaskStatus, number> = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 25,
        [TaskStatus.REVIEW]: 80,
        [TaskStatus.DONE]: 100,
      };

      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = Task.reconstitute(taskToUpdate.toJSON());

      try {
        updatedTask.changeStatus(newStatus);
        // derived progress update
        const newProgress = STATUS_PROGRESS_MAP[newStatus];
        updatedTask.setProgress(newProgress);

        // Optimistic Update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

        // Persist
        await repository.update(updatedTask);
      } catch (error) {
        console.error("Failed to move task", error);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? taskToUpdate : t)));
      }
    },
    [tasks, repository],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const previousTasks = [...tasks];
      // Optimistic Update
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      try {
        await repository.delete(taskId);
      } catch (error) {
        console.error("Failed to delete task", error);
        setTasks(previousTasks);
      }
    },
    [tasks, repository],
  );

  const createTask = useCallback(
    async (newTaskProps: { title: string; description: string; priority: TaskPriority; dueDate?: Date | null }) => {
      // Use Factory method
      const task = Task.create(
        newTaskProps.title,
        newTaskProps.description,
        newTaskProps.priority, // Assumed to be TaskPriority
        newTaskProps.dueDate,
      );

      // Optimistic Update
      setTasks((prev) => [task, ...prev]);

      try {
        await repository.create(task);
      } catch (error) {
        console.error("Failed to create task", error);
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    },
    [repository],
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
