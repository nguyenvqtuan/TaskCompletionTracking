import { TaskStatus } from "../enums/TaskStatus";
import { TaskPriority } from "../enums/TaskPriority";
import { ValidationError } from "../errors/DomainError";

interface TaskProps {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    createdAt: Date;
}

export class Task {
    private constructor(private props: TaskProps) {
        this.validate();
    }

    // Factory method for creating new tasks
    // Enforces creation rules (e.g. required title)
    static create(
        title: string,
        description: string = '',
        priority: TaskPriority = TaskPriority.MEDIUM,
        dueDate: Date | null = null
    ): Task {
        return new Task({
            id: crypto.randomUUID(), // In a real app, ID might come from DB or be a ValueObject
            title,
            description,
            status: TaskStatus.TODO, // New tasks always start as TODO
            priority,
            dueDate,
            createdAt: new Date()
        });
    }

    // Method to reconstitute from Persistence/Repository
    // Bypasses creation defaults (like status=TODO)
    static reconstitute(props: TaskProps): Task {
        return new Task(props);
    }

    // Domain Behaviors

    public changeStatus(newStatus: TaskStatus): void {
        // Here we could add transition rules
        // e.g., if (this.props.status === TaskStatus.DONE && newStatus === TaskStatus.TODO) throw ...
        this.props.status = newStatus;
    }

    public updateDetails(title: string, description: string, priority: TaskPriority): void {
        this.props.title = title;
        this.props.description = description;
        this.props.priority = priority;
        this.validate();
    }

    private validate(): void {
        if (!this.props.title || this.props.title.trim().length < 3) {
            throw new ValidationError("Task title must be at least 3 characters long.");
        }
    }

    // Getters (Immutable access)
    get id(): string { return this.props.id; }
    get title(): string { return this.props.title; }
    get description(): string { return this.props.description; }
    get status(): TaskStatus { return this.props.status; }
    get priority(): TaskPriority { return this.props.priority; }
    get dueDate(): Date | null { return this.props.dueDate; }
    get createdAt(): Date { return this.props.createdAt; }

    // For serialization if needed
    public toJSON(): TaskProps {
        return { ...this.props };
    }
}
