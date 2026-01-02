import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import { CreateTaskDTO } from "@/application/dtos/TaskDTOs";

export class CreateTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: CreateTaskDTO): Promise<Task> {
    const task = Task.create(input.title, input.description, input.priority, input.dueDate);

    return await this.taskRepository.create(task);
  }
}
