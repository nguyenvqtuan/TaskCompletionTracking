import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useAuth } from "@/app/context/AuthContext";
import { TaskPriority } from "@/domain/enums/TaskPriority";
import { TaskStatus } from "@/domain/enums/TaskStatus";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Task } from "@/domain/entities/Task";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, isLoading, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);

  // Local form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (tasks.length > 0 && id) {
      const found = tasks.find((t) => t.id === id);
      if (found) {
        setTask(found);
        setTitle(found.title);
        setDescription(found.description);
        setPriority(found.priority);
        setStatus(found.status);
      }
    }
  }, [tasks, id]);

  const { addComment } = useTasks();

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim()) return;
    try {
      await addComment(id, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleSave = async () => {
    if (!task || !id) return;
    try {
      await updateTask({
        id,
        title,
        description,
        priority,
        status,
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!task) return <div className="p-8">Task not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Board
      </Button>

      <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold tracking-tight">Task Details</h1>
          {user?.isAdmin() && (
            <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Task (Admin Only)">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">Comments</h2>

        <div className="space-y-4">
          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground/90">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No comments yet.</p>
          )}

          <div className="pt-4 space-y-2">
            <label className="text-sm font-medium">Add a comment</label>
            <div className="flex gap-2">
              <Input
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
