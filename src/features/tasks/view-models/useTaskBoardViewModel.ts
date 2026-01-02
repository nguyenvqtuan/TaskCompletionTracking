import { useState, useCallback, useMemo, useEffect } from 'react';
import { Task, TaskStatus, TaskFilters } from '../types';
import { TaskRepository } from '../repositories/TaskRepository';

// View Mode type
export type ViewMode = 'grid' | 'list';

export function useTaskBoardViewModel(repository: TaskRepository) {
    // 1. Core State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. UI State
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filters, setFilters] = useState<TaskFilters>({
        status: 'all',
        priority: 'all',
        search: '',
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
    const updateProgress = useCallback(async (taskId: string, newProgress: number) => {
        const clampedProgress = Math.min(100, Math.max(0, newProgress));

        // Find task to update
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;

        let newStatus = taskToUpdate.status;

        // Auto-status logic
        if (clampedProgress === 100) {
            newStatus = 'done';
        } else if (clampedProgress === 0) {
            newStatus = 'todo';
        } else if (taskToUpdate.status === 'todo' || taskToUpdate.status === 'done') {
            newStatus = 'in_progress';
        }

        const updatedTask = {
            ...taskToUpdate,
            progress: clampedProgress,
            status: newStatus
        };

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

        // Persist
        try {
            await repository.update(updatedTask);
        } catch (error) {
            console.error("Failed to update task progress", error);
            // Revert on failure (omitted for brevity in this MVP, but best practice)
        }
    }, [tasks, repository]);

    const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
        const STATUS_PROGRESS_MAP: Record<TaskStatus, number> = {
            'todo': 0,
            'in_progress': 25,
            'review': 80,
            'done': 100
        };

        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;

        const updatedTask = {
            ...taskToUpdate,
            status: newStatus,
            progress: STATUS_PROGRESS_MAP[newStatus]
        };

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

        // Persist
        try {
            await repository.update(updatedTask);
        } catch (error) {
            console.error("Failed to move task", error);
        }
    }, [tasks, repository]);

    const deleteTask = useCallback(async (taskId: string) => {
        // Optimistic Update
        setTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await repository.delete(taskId);
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    }, [repository]);

    const createTask = useCallback(async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
        const task: Task = {
            ...newTask,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        // Optimistic Update
        setTasks(prev => [task, ...prev]);

        try {
            await repository.create(task);
        } catch (error) {
            console.error("Failed to create task", error);
        }
    }, [repository]);

    const updateFilter = useCallback((updates: Partial<TaskFilters>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    }, []);

    // 3. Derived State: Apply filters & Search
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Status Filter
            if (filters.status !== 'all' && task.status !== filters.status) return false;
            // Priority Filter
            if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
            // Search Filter
            if (filters.search.trim()) {
                const query = filters.search.toLowerCase();
                const matchesSearch = task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }
            return true;
        });
    }, [tasks, filters]);

    // Grouping for Kanban Board
    const columns = useMemo(() => ({
        todo: filteredTasks.filter(t => t.status === 'todo'),
        in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
        review: filteredTasks.filter(t => t.status === 'review'),
        done: filteredTasks.filter(t => t.status === 'done'),
    }), [filteredTasks]);

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
