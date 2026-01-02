import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { TaskStatus } from "@/features/tasks/types";
import { cn } from "@/shared/utils/cn";

interface TaskStatusBadgeProps {
    status: TaskStatus;
    className?: string;
    showIcon?: boolean;
}

export function TaskStatusBadge({ status, className, showIcon = true }: TaskStatusBadgeProps) {
    const config: Record<TaskStatus, { variant: "default" | "secondary" | "outline" | "success" | "warning" | "info"; icon: React.ElementType, label: string }> = {
        todo: {
            variant: "secondary",
            icon: Circle,
            label: "To Do"
        },
        in_progress: {
            variant: "info",
            icon: Clock,
            label: "In Progress"
        },
        review: {
            variant: "warning",
            icon: AlertCircle,
            label: "Review"
        },
        done: {
            variant: "success",
            icon: CheckCircle2,
            label: "Done"
        },
    };

    const { variant, icon: Icon, label } = config[status];

    return (
        <Badge variant={variant} className={cn("gap-1.5", className)}>
            {showIcon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </Badge>
    );
}
