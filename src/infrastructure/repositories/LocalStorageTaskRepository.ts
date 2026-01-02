import { Task } from "../../../domain/entities/Task";
import { TaskRepository } from "../../../application/interfaces/repositories/TaskRepository";

const STORAGE_KEY = 'task-clean-arch-db';

export class LocalStorageTaskRepository implements TaskRepository {

    async getAll(): Promise<Task[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        try {
            const rawTasks = JSON.parse(data);
            return rawTasks.map((raw: any) => this.mapToEntity(raw));
        } catch (error) {
            console.error("Failed to parse tasks from storage", error);
            return [];
        }
    }

    async getById(id: string): Promise<Task | null> {
        const tasks = await this.getAll();
        return tasks.find(t => t.id === id) || null;
    }

    async create(task: Task): Promise<Task> {
        const tasks = await this.getAll();
        tasks.push(task);
        this.persist(tasks);
        return task;
    }

    async update(task: Task): Promise<Task> {
        const tasks = await this.getAll();
        const index = tasks.findIndex(t => t.id === task.id);

        if (index !== -1) {
            tasks[index] = task;
            this.persist(tasks);
        }

        return task;
    }

    async delete(id: string): Promise<void> {
        const tasks = await this.getAll();
        const filtered = tasks.filter(t => t.id !== id);
        this.persist(filtered);
    }

    private persist(tasks: Task[]): void {
        // Task.toJSON() or the public getters will be used by JSON.stringify
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    private mapToEntity(raw: any): Task {
        // We need to restore Date objects because JSON makes them strings
        return Task.reconstitute({
            ...raw,
            dueDate: raw.dueDate ? new Date(raw.dueDate) : null,
            createdAt: new Date(raw.createdAt)
        });
    }
}
