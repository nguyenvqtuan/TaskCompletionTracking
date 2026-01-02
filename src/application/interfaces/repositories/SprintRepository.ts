import { Sprint } from "@/domain/entities/Sprint";

export interface SprintRepository {
  getAll(): Promise<Sprint[]>;
  getById(id: string): Promise<Sprint | null>;
  create(sprint: Sprint): Promise<Sprint>;
  update(sprint: Sprint): Promise<Sprint>;
  delete(id: string): Promise<void>;
}
