import { Task } from "@/domain/entities/Task";

export interface TaskRepository {
  /**
   * Retrieves all tasks.
   */
  getAll(): Promise<Task[]>;

  /**
   * Retrieves a single task by its ID.
   * Returns null if not found.
   */
  getById(id: string): Promise<Task | null>;

  /**
   * Persists a new task.
   */
  create(task: Task): Promise<Task>;

  /**
   * Updates an existing task.
   */
  update(task: Task): Promise<Task>;

  /**
   * Deletes a task by its ID.
   */
  delete(id: string): Promise<void>;
}
