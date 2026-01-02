import { TaskStatus } from "../enums/TaskStatus";
import { TaskPriority } from "../enums/TaskPriority";
import { ValidationError } from "../errors/DomainError";
import { Comment, CommentProps } from "./Comment";

export interface TaskProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  progress: number;
  comments: CommentProps[];
  sprintId?: string;
}

export class Task {
  private constructor(private props: TaskProps) {
    this.validate();
  }

  // Factory method for creating new tasks
  static create(
    title: string,
    description: string = "",
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate: Date | null = null,
  ): Task {
    return new Task({
      id: crypto.randomUUID(),
      title,
      description,
      status: TaskStatus.TODO,
      priority,
      dueDate,
      createdAt: new Date(),
      progress: 0,
      comments: [],
      sprintId: undefined,
    });
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  // Domain Behaviors

  public changeStatus(newStatus: TaskStatus): void {
    this.props.status = newStatus;
  }

  public updateDetails(title: string, description: string, priority: TaskPriority): void {
    this.props.title = title;
    this.props.description = description;
    this.props.priority = priority;
    this.validate();
  }

  public setProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new ValidationError("Progress must be between 0 and 100");
    }
    this.props.progress = progress;
  }

  public addComment(comment: Comment): void {
    this.props.comments.push(comment.toJSON());
  }

  public assignToSprint(sprintId: string): void {
    this.props.sprintId = sprintId;
  }

  public removeFromSprint(): void {
    this.props.sprintId = undefined;
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length < 3) {
      throw new ValidationError("Task title must be at least 3 characters long.");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get status(): TaskStatus {
    return this.props.status;
  }
  get priority(): TaskPriority {
    return this.props.priority;
  }
  get dueDate(): Date | null {
    return this.props.dueDate;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get progress(): number {
    return this.props.progress;
  }
  get sprintId(): string | undefined {
    return this.props.sprintId;
  }

  get comments(): Comment[] {
    return this.props.comments.map((c) => Comment.reconstitute(c));
  }

  public toJSON(): TaskProps {
    return { ...this.props };
  }
}
