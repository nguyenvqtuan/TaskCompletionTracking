import { cn } from "@/shared/utils/cn";

interface TaskProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
}

export function TaskProgressBar({ progress, className }: TaskProgressBarProps) {
    // Clamp value
    const value = Math.min(100, Math.max(0, progress));

    // Determine color based on progress
    let colorClass = "bg-primary";
    if (value === 100) colorClass = "bg-emerald-500";
    else if (value > 66) colorClass = "bg-blue-500";
    else if (value > 33) colorClass = "bg-amber-500";
    else colorClass = "bg-slate-400";

    return (
        <div className={cn("w-full bg-secondary/50 rounded-full h-2 overflow-hidden", className)}>
            <div
                className={cn("h-full transition-all duration-500 ease-in-out", colorClass)}
                style={{ width: `${value}%` }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    );
}
