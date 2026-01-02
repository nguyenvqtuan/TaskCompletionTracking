import { Task } from "@/domain/entities/Task";
import { Comment } from "@/domain/entities/Comment";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";

interface AddCommentDTO {
  taskId: string;
  content: string;
  author?: string;
}

export class AddComment {
  constructor(private taskRepository: TaskRepository) {}

  async execute({ taskId, content, author }: AddCommentDTO): Promise<Task> {
    const task = await this.taskRepository.getById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const comment = Comment.create(content, author);
    task.addComment(comment);

    await this.taskRepository.update(task);
    return task;
  }
}
