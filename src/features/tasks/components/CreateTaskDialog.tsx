import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { TaskPriority } from "@/features/tasks/types";

interface CreateTaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate?: Date | null;
}

interface CreateTaskDialogProps {
    onCreate: (task: CreateTaskInput) => void;
}

export function CreateTaskDialog({ onCreate }: CreateTaskDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        onCreate({
            title,
            description,
            priority,
            dueDate: null // Default for now
        });

        // Reset and close
        setTitle("");
        setDescription("");
        setPriority(TaskPriority.MEDIUM);
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New Task
            </Button>
        );
    }

    // A simple accessible-modal-like implementation without external libs
    return (
        <>
            {/* Trigger Button - Hidden but preserves layout if needed, though we replace it here */}
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                {/* Dialog Content */}
                <div
                    className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight">Create New Task</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Title</label>
                            <Input
                                placeholder="E.g. Refactor API"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Description</label>
                            <Input
                                placeholder="Brief description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Priority</label>
                            <div className="flex gap-2">
                                {Object.values(TaskPriority).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${priority === p
                                            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20'
                                            : 'bg-background hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Task</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
