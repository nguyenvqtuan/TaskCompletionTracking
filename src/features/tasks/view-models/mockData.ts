import { Task, User } from "../types";

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alex' },
    { id: 'u2', name: 'Sam' },
    { id: 'u3', name: 'Jordan' },
];

export const MOCK_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Design System Audit',
        description: 'Review current component usage and identify inconsistencies.',
        status: 'in_progress',
        priority: 'high',
        progress: 45,
        assignee: MOCK_USERS[0],
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
        id: 't2',
        title: 'Setup CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        status: 'todo',
        priority: 'medium',
        progress: 0,
        assignee: MOCK_USERS[1],
        createdAt: new Date().toISOString(),
    },
    {
        id: 't3',
        title: 'User API Integration',
        description: 'Connect frontend to the new User Service endpoints.',
        status: 'done',
        priority: 'high',
        progress: 100,
        assignee: MOCK_USERS[2],
        createdAt: new Date().toISOString(),
    },
    {
        id: 't4',
        title: 'Fix Navigation Bug',
        description: 'Menu does not close on mobile when clicking outside.',
        status: 'review',
        priority: 'low',
        progress: 90,
        assignee: MOCK_USERS[0],
        createdAt: new Date().toISOString(),
    },
];
