export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface UserProps {
  id: string;
  username: string;
  role: UserRole;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(username: string, role: UserRole): User {
    return new User({
      id: crypto.randomUUID(),
      username,
      role,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }
  get username(): string {
    return this.props.username;
  }
  get role(): UserRole {
    return this.props.role;
  }

  public isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  public toJSON(): UserProps {
    return { ...this.props };
  }
}
