import { Sprint } from "@/domain/entities/Sprint";
import { SprintRepository } from "@/application/interfaces/repositories/SprintRepository";

export interface CreateSprintDTO {
  name: string;
  startDate: Date;
  endDate: Date;
}

export class CreateSprint {
  constructor(private sprintRepository: SprintRepository) {}

  async execute(input: CreateSprintDTO): Promise<Sprint> {
    const sprint = Sprint.create(input.name, input.startDate, input.endDate);
    return await this.sprintRepository.create(sprint);
  }
}
