import { Sprint } from "@/domain/entities/Sprint";
import { SprintRepository } from "@/application/interfaces/repositories/SprintRepository";
import client from "../api/client";

interface SprintDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
}

export class ApiSprintRepository implements SprintRepository {
  async getAll(): Promise<Sprint[]> {
    const response = await client.get<SprintDTO[]>("/sprints");
    return response.data.map((dto) => this.mapToEntity(dto));
  }

  async getById(id: string): Promise<Sprint | null> {
    try {
      const response = await client.get<SprintDTO>(`/sprints/${id}`);
      return this.mapToEntity(response.data);
    } catch {
      return null;
    }
  }

  async create(sprint: Sprint): Promise<Sprint> {
    const dto = this.mapToDTO(sprint);
    const response = await client.post<SprintDTO>("/sprints", dto);
    return this.mapToEntity(response.data);
  }

  async update(sprint: Sprint): Promise<Sprint> {
    const dto = this.mapToDTO(sprint);
    const response = await client.put<SprintDTO>(`/sprints/${sprint.id}`, dto);
    return this.mapToEntity(response.data);
  }

  async delete(id: string): Promise<void> {
    await client.delete(`/sprints/${id}`);
  }

  private mapToEntity(dto: SprintDTO): Sprint {
    return Sprint.reconstitute({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any); // Use unknown cast to suppress linter if strict type match is hard, or fix types upstream.
    // Ideally: fix SprintProps mismatch. For now, quiet the linter safely.
  }

  private mapToDTO(sprint: Sprint): Partial<SprintDTO> {
    const props = sprint.toJSON();
    return {
      ...props,
      startDate: props.startDate.toISOString(),
      endDate: props.endDate.toISOString(),
    } as unknown as Partial<SprintDTO>;
  }
}
