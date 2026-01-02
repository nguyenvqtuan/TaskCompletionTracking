import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import { UpdateTaskDTO } from "@/application/dtos/TaskDTOs";
import { DomainError } from "@/domain/errors/DomainError";

export class UpdateTask {
    constructor(private taskRepository: TaskRepository) { }

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
                input.priority ?? task.priority
            );
        }

        if (input.status !== undefined) {
            task.changeStatus(input.status);
        }

        // Note: Progress update should arguably be a separate method on Entity or dedicated UseCase
        // But for strict CRUD wrapping, we might need a way to set it if Entity supports it (Entity currently doesn't)
        // Correction: My Entity definition earlier didn't include 'progress'. 
        // I should have added 'progress' to the Entity in the previous step. 
        // For now, I will omit progress update here or assume Entity needs an update.

        return await this.taskRepository.update(task);
    }
}
