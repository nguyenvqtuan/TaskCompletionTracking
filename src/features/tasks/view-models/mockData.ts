import { Task } from "../../../domain/entities/Task";
import { TaskStatus } from "../../../domain/enums/TaskStatus";
import { TaskPriority } from "../../../domain/enums/TaskPriority";

export const MOCK_TASKS: Task[] = [
  Task.reconstitute({
    id: "t1",
    title: "Design System Audit",
    description: "Review current component usage and identify inconsistencies.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    progress: 45,
    comments: [],
    // Assignee is not part of Task entity yet
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 2),
  }),
  Task.reconstitute({
    id: "t2",
    title: "Setup CI/CD Pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    progress: 0,
    comments: [],
    createdAt: new Date(),
    dueDate: null,
  }),
  Task.reconstitute({
    id: "t3",
    title: "User API Integration",
    description: "Connect frontend to the new User Service endpoints.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    progress: 100,
    comments: [],
    createdAt: new Date(),
    dueDate: new Date(),
  }),
  Task.reconstitute({
    id: "t4",
    title: "Fix Navigation Bug",
    description: "Menu does not close on mobile when clicking outside.",
    status: TaskStatus.REVIEW,
    priority: TaskPriority.LOW,
    progress: 90,
    comments: [],
    createdAt: new Date(),
    dueDate: new Date(),
  }),
];
