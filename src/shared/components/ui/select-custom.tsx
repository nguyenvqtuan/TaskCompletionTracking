import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { createPortal } from "react-dom";

interface SelectOption<T extends string> {
  value: T | "all";
  label: string;
  icon?: React.ReactNode;
  className?: string; // For custom styling of the option
}

interface CustomSelectProps<T extends string> {
  value: T | "all";
  onChange: (value: T | "all") => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string; // Optional prefix label like "Status:"
  className?: string;
  includeAllOption?: boolean;
}

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  className,
  includeAllOption = true,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((opt) => opt.value === value);

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
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Handle scroll to update position if needed (simple implementation just closes on scroll usually,
  // but here we let it stay or close. Let's just recalculate to be safe or close on scroll)
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => setIsOpen(false); // Easiest way to handle complex scrolling
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen]);

  const handleSelect = (newValue: T | "all") => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("inline-block", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-between w-full h-10 px-4 py-2 text-sm bg-background border rounded-lg transition-all duration-200 hover:bg-accent/50 hover:border-accent hover:shadow-sm group", // Increased height, rounded-lg, hover effects
          isOpen && "ring-2 ring-primary/20 border-primary",
          value !== "all" && "bg-secondary/30 border-secondary-foreground/10 text-secondary-foreground font-medium",
        )}
      >
        <div className="flex items-center gap-2 truncate max-w-full">
          {label && <span className="text-muted-foreground font-normal flex-shrink-0">{label}</span>}
          <span className={cn("truncate block", value !== "all" && "text-foreground")}>
            {selectedOption
              ? selectedOption.label
              : value === "all" && includeAllOption
                ? `All ${label || ""} `
                : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out flex-shrink-0 group-hover:text-foreground",
            isOpen && "transform rotate-180 text-primary",
          )}
        />
      </button>

      {/* Dropdown Menu via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-2 bg-popover/95 backdrop-blur-sm text-popover-foreground border border-border/50 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
            style={{
              top: position.top + 6,
              left: position.left,
              width: Math.max(position.width, 220),
            }}
          >
            <div className="p-1.5 max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {includeAllOption && (
                <div
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-1",
                    value === "all" && "bg-accent/80 text-accent-foreground font-medium",
                  )}
                  onClick={() => handleSelect("all")}
                >
                  <span className="flex-1 truncate">All {label}</span>
                  {value === "all" && <Check className="ml-auto h-4 w-4 text-primary" />}
                </div>
              )}

              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mb-0.5 last:mb-0",
                    value === option.value && "bg-accent/80 text-accent-foreground font-medium",
                    option.className,
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="flex-1 truncate flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {value === option.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
