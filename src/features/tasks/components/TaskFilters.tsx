import { SearchBar } from "@/shared/components/ui/search-bar";
import { Button } from "@/shared/components/ui/button";
import { TaskFilters as FilterState, TaskPriority, TaskStatus } from "@/features/tasks/types";
import { X, LayoutGrid, List as ListIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { CustomSelect } from "@/shared/components/ui/select-custom";
import { ViewMode } from "../view-models/useTaskBoardViewModel";

interface TaskFiltersProps {
    filters: FilterState;
    onUpdate: (updates: Partial<FilterState>) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    className?: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
    { value: TaskStatus.TODO, label: 'To Do', color: 'bg-slate-400' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-400' },
    { value: TaskStatus.REVIEW, label: 'In Review', color: 'bg-amber-400' },
    { value: TaskStatus.DONE, label: 'Done', color: 'bg-emerald-400' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: TaskPriority.LOW, label: 'Low', color: 'bg-slate-400' },
    { value: TaskPriority.MEDIUM, label: 'Medium', color: 'bg-amber-400' },
    { value: TaskPriority.HIGH, label: 'High', color: 'bg-red-400' },
];

export function TaskFilters({ filters, onUpdate, viewMode, onViewModeChange, className }: TaskFiltersProps) {
    const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search !== '';

    const clearFilters = () => {
        onUpdate({
            status: 'all',
            priority: 'all',
            search: ''
        });
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-2", className)}>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center border rounded-md p-0.5 bg-background">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange('grid')}
                        className={cn("h-8 w-8 p-0 rounded-sm", viewMode === 'grid' ? "bg-muted/50" : "text-muted-foreground hover:text-foreground")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className={cn("h-8 w-8 p-0 rounded-sm", viewMode === 'list' ? "bg-muted/50" : "text-muted-foreground hover:text-foreground")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>

            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {/* Search */}
                <SearchBar
                    value={filters.search}
                    onChange={(v) => onUpdate({ search: v })}
                    className="w-auto"
                />

                {/* Status Filter */}
                <CustomSelect
                    value={filters.status}
                    options={STATUS_OPTIONS}
                    onChange={(val) => onUpdate({ status: val as TaskStatus | 'all' })}
                    className="w-[140px]"
                />

                {/* Priority Filter */}
                <CustomSelect
                    value={filters.priority}
                    options={PRIORITY_OPTIONS}
                    onChange={(val) => onUpdate({ priority: val as TaskPriority | 'all' })}
                    className="w-[140px]"
                />

                {/* Clear Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground h-8 px-2 lg:px-3"
                    >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        <span className="hidden lg:inline">Clear</span>
                    </Button>
                )}
            </div>
        </div >
    );
}
