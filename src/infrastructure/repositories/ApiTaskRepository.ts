import { Task } from "@/domain/entities/Task";
import { TaskRepository } from "@/application/interfaces/repositories/TaskRepository";
import client from "../api/client";
import { CommentProps } from "@/domain/entities/Comment";

// DTOs matching Backend responses
interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  progress: number;
  comments: CommentDTO[];
  sprintId?: string;
}

interface CommentDTO {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export class ApiTaskRepository implements TaskRepository {
  async getAll(): Promise<Task[]> {
    const response = await client.get<TaskDTO[]>("/task");
    return response.data.map((dto) => this.mapToEntity(dto));
  }

  async getById(id: string): Promise<Task | null> {
    try {
      const response = await client.get<TaskDTO>(`/task/${id}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      return null;
    }
  }

  async create(task: Task): Promise<Task> {
    const dto = this.mapToDTO(task);
    // Remove ID for creation to let backend generate it
    const { id, ...createDto } = dto;
    const response = await client.post<TaskDTO>("/task", createDto);
    return this.mapToEntity(response.data);
  }

  async update(task: Task): Promise<Task> {
    const dto = this.mapToDTO(task);
    const response = await client.put<TaskDTO>(`/task/${task.id}`, dto);
    return this.mapToEntity(response.data);
  }

  async delete(id: string): Promise<void> {
    await client.delete(`/task/${id}`);
  }

  private mapToEntity(dto: TaskDTO): Task {
    return Task.reconstitute({
      id: dto.id,
      title: dto.title,
      description: dto.description,
      // Map Backend Uppercase to Domain Lowercase
      status: dto.status.toLowerCase() as any,
      priority: dto.priority.toLowerCase() as any,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdAt: new Date(dto.createdAt),
      progress: dto.progress,
      sprintId: dto.sprintId,
      comments: (dto.comments || []).map((c) => ({
        id: c.id,
        content: c.content,
        // Backend DTO might send authorId, but frontend expects author name.
        // Using authorId as fallback or assuming it is the name for now.
        author: c.authorId || "Unknown",
        createdAt: new Date(c.createdAt),
      })) as CommentProps[],
    });
  }

  private mapToDTO(task: Task): any {
    const props = task.toJSON();
    return {
      ...props,
      // Convert to backend expectation (often Uppercase for Enums)
      status: props.status.toUpperCase(),
      priority: props.priority.toUpperCase(),
      sprintId: props.sprintId ?? null,
      removeSprint: !props.sprintId, // Backend requires explicit flag to remove sprint
      // Ensure specific date format if needed, though ISO string is usually fine.
      dueDate: props.dueDate ? props.dueDate.toISOString() : null,
      createdAt: props.createdAt.toISOString(),
      comments: [], // Usually we don't send comments on task update/create main payload, handled separately
    };
  }
}
