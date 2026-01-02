import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import { TaskStatus } from "@/domain/enums/TaskStatus";
import { TaskPriority } from "@/domain/enums/TaskPriority";

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}

export class GetTaskStatistics {
  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<TaskStatistics> {
    const tasks = await this.taskRepository.getAll();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const tasksByStatus = Object.values(TaskStatus).reduce(
      (acc, status) => {
        acc[status] = tasks.filter((t) => t.status === status).length;
        return acc;
      },
      {} as Record<TaskStatus, number>,
    );

    const tasksByPriority = Object.values(TaskPriority).reduce(
      (acc, priority) => {
        acc[priority] = tasks.filter((t) => t.priority === priority).length;
        return acc;
      },
      {} as Record<TaskPriority, number>,
    );

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
    };
  }
}
