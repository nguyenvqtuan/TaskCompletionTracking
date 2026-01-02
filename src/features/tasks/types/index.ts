export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

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

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number; // 0-100
    assignee?: User;
    dueDate?: string;
    createdAt: string;
}
