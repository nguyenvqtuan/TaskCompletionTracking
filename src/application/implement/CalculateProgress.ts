import { TaskStatus } from "@/domain/enums/TaskStatus";

export class CalculateProgress {
    // Pure logic, static execution is fine, or instance.
    // Making it an instance for consistency if we needed deps later.

    execute(status: TaskStatus): number {
        switch (status) {
            case TaskStatus.TODO:
                return 0;
            case TaskStatus.IN_PROGRESS:
                return 25;
            case TaskStatus.REVIEW:
                return 80;
            case TaskStatus.DONE:
                return 100;
            default:
                return 0;
        }
    }
}
