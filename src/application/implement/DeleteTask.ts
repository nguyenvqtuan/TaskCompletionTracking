import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";

export class DeleteTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    return await this.taskRepository.delete(id);
  }
}
