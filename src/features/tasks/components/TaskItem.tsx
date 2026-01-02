import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Task } from "@/domain/entities/Task";
import { TaskPriority } from "@/domain/enums/TaskPriority";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskProgressBar } from "./TaskProgressBar";

interface TaskItemProps {
  task: Task;
}

const PRIORITY_STYLES = {
  [TaskPriority.LOW]: "text-slate-600 border-slate-200 bg-slate-100",
  [TaskPriority.MEDIUM]: "text-orange-700 border-orange-200 bg-orange-100",
  [TaskPriority.HIGH]: "text-red-700 border-red-200 bg-red-100",
};

export function TaskItem({ task }: TaskItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
      <CardHeader className="p-4 pb-3 space-y-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className={cn("text-[10px] uppercase tracking-wider", PRIORITY_STYLES[task.priority])}
          >
            {task.priority}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="font-medium text-sm leading-tight text-foreground">{task.title}</h3>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(task.progress)}%</span>
          </div>
          <TaskProgressBar progress={task.progress} />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 flex items-center justify-between border-t bg-muted/30 mt-auto">
        <div className="flex items-center gap-2">
          {/* Placeholder for assignee since it's not in Domain yet */}
          <div className="w-6 h-6 rounded-full border border-dashed flex items-center justify-center">
            <span className="text-[10px] icon-[lucide--user]" />
          </div>
          <TaskStatusBadge status={task.status} showIcon={false} className="text-[10px] px-1.5 py-0 h-5" />
        </div>

        {task.dueDate && (
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
