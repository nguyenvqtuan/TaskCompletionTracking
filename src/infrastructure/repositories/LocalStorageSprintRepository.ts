import { Sprint, SprintProps } from "@/domain/entities/Sprint";
import { SprintRepository } from "@/application/interfaces/repositories/SprintRepository";

const STORAGE_KEY = "sprint-clean-arch-db";

type StoredSprintProps = Omit<SprintProps, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

export class LocalStorageSprintRepository implements SprintRepository {
  async getAll(): Promise<Sprint[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const rawSprints = JSON.parse(data) as StoredSprintProps[];
      return rawSprints.map((raw) => this.mapToEntity(raw));
    } catch (error) {
      console.error("Failed to parse sprints", error);
      return [];
    }
  }

  async getById(id: string): Promise<Sprint | null> {
    const sprints = await this.getAll();
    return sprints.find((s) => s.id === id) || null;
  }

  async create(sprint: Sprint): Promise<Sprint> {
    const sprints = await this.getAll();
    sprints.push(sprint);
    this.persist(sprints);
    return sprint;
  }

  async update(sprint: Sprint): Promise<Sprint> {
    const sprints = await this.getAll();
    const index = sprints.findIndex((s) => s.id === sprint.id);
    if (index !== -1) {
      sprints[index] = sprint;
      this.persist(sprints);
    }
    return sprint;
  }

  async delete(id: string): Promise<void> {
    const sprints = await this.getAll();
    const filtered = sprints.filter((s) => s.id !== id);
    this.persist(filtered);
  }

  private persist(sprints: Sprint[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sprints));
  }

  private mapToEntity(raw: StoredSprintProps): Sprint {
    return Sprint.reconstitute({
      ...raw,
      startDate: new Date(raw.startDate),
      endDate: new Date(raw.endDate),
    });
  }
}
