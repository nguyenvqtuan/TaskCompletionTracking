import { Sprint } from "@/domain/entities/Sprint";
import { SprintRepository } from "@/application/interfaces/repositories/SprintRepository";

export class GetSprints {
  constructor(private sprintRepository: SprintRepository) {}

  async execute(): Promise<Sprint[]> {
    return await this.sprintRepository.getAll();
  }
}
