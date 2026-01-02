export interface CommentProps {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export class Comment {
  private constructor(private props: CommentProps) {}

  static create(content: string, author: string = "User"): Comment {
    return new Comment({
      id: crypto.randomUUID(),
      content,
      author, // In a real app, this would come from Auth Context
      createdAt: new Date(),
    });
  }

  static reconstitute(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string {
    return this.props.id;
  }
  get content(): string {
    return this.props.content;
  }
  get author(): string {
    return this.props.author;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): CommentProps {
    return { ...this.props };
  }
}
