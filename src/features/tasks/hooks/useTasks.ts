import { useState, useEffect, useCallback } from "react";
import { Task } from "../../../domain/entities/Task";
import { CreateTaskDTO, UpdateTaskDTO } from "../../../application/dtos/TaskDTOs";
import { useTaskDependencies } from "../../../app/context/TaskDependenciesContext";
import { TaskStatus } from "../../../domain/enums/TaskStatus";

export function useTasks() {
    const {
        createTask,
        getTasks,
        updateTask,
        deleteTask,
        calculateProgress
    } = useTaskDependencies();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTasks.execute();
            setTasks(data);
        } catch (err) {
            setError("Failed to load tasks");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [getTasks]);

    // Initial load
    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleCreateTask = useCallback(async (input: CreateTaskDTO) => {
        try {
            const newTask = await createTask.execute(input);
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            console.error("Failed to create task", err);
            throw err;
        }
    }, [createTask]);

    const handleUpdateTask = useCallback(async (input: UpdateTaskDTO) => {
        try {
            const updated = await updateTask.execute(input);
            setTasks(prev => prev.map(t => t.id === input.id ? updated : t));
            return updated;
        } catch (err) {
            console.error("Failed to update task", err);
            throw err;
        }
    }, [updateTask]);

    const handleMoveTask = useCallback(async (id: string, newStatus: TaskStatus) => {
        try {
            // 1. Calculate new progress based on status rule
            const newProgress = calculateProgress.execute(newStatus);

            // 2. Perform update
            const updated = await updateTask.execute({
                id,
                status: newStatus,
                progress: newProgress
            });

            // 3. Update local state
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err) {
            console.error("Failed to move task", err);
            throw err;
        }
    }, [updateTask, calculateProgress]);

    const handleDeleteTask = useCallback(async (id: string) => {
        try {
            await deleteTask.execute(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Failed to delete task", err);
            throw err;
        }
    }, [deleteTask]);

    return {
        tasks,
        isLoading,
        error,
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        moveTask: handleMoveTask,
        deleteTask: handleDeleteTask,
        refresh: loadTasks
    };
}
