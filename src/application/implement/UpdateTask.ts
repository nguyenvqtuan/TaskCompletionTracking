import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import { UpdateTaskDTO } from "@/application/dtos/TaskDTOs";
import { DomainError } from "@/domain/errors/DomainError";

export class UpdateTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.getById(input.id);

    if (!task) {
      throw new DomainError(`Task with id ${input.id} not found`);
    }

    // Apply updates via Domain Entity methods
    if (input.title !== undefined || input.description !== undefined || input.priority !== undefined) {
      task.updateDetails(
        input.title ?? task.title,
        input.description ?? task.description,
        input.priority ?? task.priority,
      );
    }

    if (input.status !== undefined) {
      task.changeStatus(input.status);
    }

    if (input.progress !== undefined) {
      task.setProgress(input.progress);
    }

    if (input.sprintId !== undefined) {
      if (input.sprintId === null) {
        task.removeFromSprint();
      } else {
        task.assignToSprint(input.sprintId);
      }
    }

    return await this.taskRepository.update(task);
  }
}
