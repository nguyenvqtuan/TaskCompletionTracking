import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";

export class GetTaskById {
  constructor(private taskRepository: TaskRepository) { }

  async execute(id: string): Promise<Task | null> {
    return await this.taskRepository.getById(id);
  }
}
