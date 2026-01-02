import { Task } from "../../../domain/entities/Task";
import { TaskStatus } from "../../../domain/enums/TaskStatus";
import { TaskPriority } from "../../../domain/enums/TaskPriority";

export { Task, TaskStatus, TaskPriority };

export interface TaskFilters {
    status: TaskStatus | 'all';
    priority: TaskPriority | 'all';
    search: string;
}

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
}

