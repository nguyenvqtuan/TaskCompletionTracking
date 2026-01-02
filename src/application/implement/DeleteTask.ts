import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import { User } from "@/domain/entities/User";
import { DomainError } from "@/domain/errors/DomainError";

export class DeleteTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string, user?: User | null): Promise<void> {
    if (!user || user.role !== "ADMIN") {
      throw new DomainError("Permission Denied: Only admins can delete tasks.");
    }
    await this.taskRepository.delete(id);
  }
}
