export enum SprintStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface SprintProps {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
}

export class Sprint {
  private constructor(private props: SprintProps) {}

  static create(name: string, startDate: Date, endDate: Date): Sprint {
    return new Sprint({
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
      status: SprintStatus.PLANNING,
    });
  }

  static reconstitute(props: SprintProps): Sprint {
    return new Sprint(props);
  }

  public start(): void {
    this.props.status = SprintStatus.ACTIVE;
  }

  public complete(): void {
    this.props.status = SprintStatus.COMPLETED;
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date {
    return this.props.endDate;
  }
  get status(): SprintStatus {
    return this.props.status;
  }

  public toJSON(): SprintProps {
    return { ...this.props };
  }
}
