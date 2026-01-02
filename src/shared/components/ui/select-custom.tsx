import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { createPortal } from "react-dom";

interface SelectOption<T extends string> {
    value: T | 'all';
    label: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string> {
    value: T | 'all';
    onChange: (value: T | 'all') => void;
    options: SelectOption<T>[];
    placeholder?: string;
    label?: string; // Optional prefix label like "Status:"
    className?: string;
}

export function CustomSelect<T extends string>({
    value,
    onChange,
    options,
    placeholder = "Select...",
    label,
    className
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update position when opening
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Handle scroll to update position if needed (simple implementation just closes on scroll usually, 
    // but here we let it stay or close. Let's just recalculate to be safe or close on scroll)
    useEffect(() => {
        if (isOpen) {
            const handleScroll = () => setIsOpen(false); // Easiest way to handle complex scrolling
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [isOpen]);

    const handleSelect = (newValue: T | 'all') => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("inline-block", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative flex items-center justify-between w-full h-9 px-3 py-2 text-sm bg-background border rounded-md transition-all hover:bg-accent hover:text-accent-foreground items-center gap-2",
                    isOpen && "ring-2 ring-ring ring-offset-0 border-transparent",
                    value !== 'all' && "bg-secondary/50 border-secondary-foreground/20 text-secondary-foreground"
                )}
            >
                <div className="flex items-center gap-2 truncate max-w-full">
                    {label && <span className="opacity-50 font-normal flex-shrink-0">{label}</span>}
                    <span className="font-medium truncate block">
                        {selectedOption ? selectedOption.label : (value === 'all' ? `All ${label || ''} ` : placeholder)}
                    </span>
                </div>
                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200 flex-shrink-0", isOpen && "transform rotate-180")} />
            </button>

            {/* Dropdown Menu via Portal */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 bg-popover text-popover-foreground border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
                    style={{
                        top: position.top + 4,
                        left: position.left,
                        width: Math.max(position.width, 180) // Min width for better readability
                    }}
                >
                    <div className="p-1 max-h-[300px] overflow-auto scrollbar-hide">
                        <div
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                value === 'all' && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => handleSelect('all')}
                        >
                            <span className="flex-1 truncate">All {label}</span>
                            {value === 'all' && <Check className="ml-auto h-4 w-4" />}
                        </div>

                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                    value === option.value && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className="flex-1 truncate">{option.label}</span>
                                {value === option.value && <Check className="ml-auto h-4 w-4" />}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
