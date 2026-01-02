import { TaskPriority } from "@/domain/enums/TaskPriority";
import { TaskStatus } from "@/domain/enums/TaskStatus";

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface UpdateTaskDTO {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  progress?: number;
  sprintId?: string | null; // null to unassign
}
