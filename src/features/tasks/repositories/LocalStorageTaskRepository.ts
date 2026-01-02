import { Task } from "../types";
import { TaskRepository } from "./TaskRepository";
import { MOCK_TASKS } from "../view-models/mockData";

const STORAGE_KEY = 'tasks-data';

export class LocalStorageTaskRepository implements TaskRepository {
    async getAll(): Promise<Task[]> {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 300));

        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            // Initialize with mock data if empty
            this.save(MOCK_TASKS);
            return MOCK_TASKS;
        }
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to parse tasks from local storage", error);
            return [];
        }
    }

    async create(task: Task): Promise<Task> {
        const tasks = await this._getTasksSync();
        const newTasks = [task, ...tasks];
        this.save(newTasks);
        return task;
    }

    async update(task: Task): Promise<Task> {
        const tasks = await this._getTasksSync();
        const newTasks = tasks.map(t => t.id === task.id ? task : t);
        this.save(newTasks);
        return task;
    }

    async delete(taskId: string): Promise<void> {
        const tasks = await this._getTasksSync();
        const newTasks = tasks.filter(t => t.id !== taskId);
        this.save(newTasks);
    }

    private save(tasks: Task[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Helper to get raw data without delay for internal updates
    private _getTasksSync(): Promise<Task[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        return Promise.resolve(data ? JSON.parse(data) : []);
    }
}
