import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Helper to clear search
    const clearSearch = () => {
        onChange("");
        setIsExpanded(false);
    };

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded) {
            inputRef.current?.focus();
        }
    }, [isExpanded]);

    return (
        <div className={cn("relative flex items-center transition-all duration-300 ease-in-out", isExpanded ? "w-64" : "w-auto", className)}>
            <div className={cn(
                "flex items-center w-full bg-background border rounded-md overflow-hidden transition-all duration-300",
                isExpanded ? "border-input shadow-sm ring-1 ring-ring/30" : "border-transparent bg-transparent"
            )}>
                {/* Toggle Button */}
                {!isExpanded && (
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(true)}
                        className="gap-2"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </Button>
                )}

                {/* Expanded Input Area */}
                {isExpanded && (
                    <>
                        <Search className="h-4 w-4 ml-3 text-muted-foreground flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Search tasks..."
                            className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            onBlur={() => {
                                // Only collapse if empty
                                if (!value) setIsExpanded(false);
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 mr-1 rounded-full hover:bg-muted"
                            onClick={clearSearch}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
