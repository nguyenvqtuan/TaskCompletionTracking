import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";

export class GetTasks {
  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepository.getAll();
  }
}
