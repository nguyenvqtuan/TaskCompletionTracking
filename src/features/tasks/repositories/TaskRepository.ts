import { Task } from "../types";

export interface TaskRepository {
    getAll(): Promise<Task[]>;
    create(task: Task): Promise<Task>;
    update(task: Task): Promise<Task>;
    delete(taskId: string): Promise<void>;
}
