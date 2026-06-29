import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelPlacement?: "inside" | "outside"
  error?: string
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, labelPlacement = "outside", placeholder, error, startContent, endContent, ...props }, ref) => {
    
    // Separate layout classes (like max-w-*, w-*, mb-*, mt-*, space-*, hidden, block, etc.) from styling classes
    // so the layout classes apply to the outer wrapper and the rest apply to the input container.
    const classes = className ? className.split(" ") : [];
    const layoutClasses: string[] = [];
    const stylingClasses: string[] = [];

    classes.forEach(c => {
      if (
        c.startsWith("max-w-") || 
        c.startsWith("w-") || 
        c.startsWith("m-") || 
        c.startsWith("mt-") || 
        c.startsWith("mb-") || 
        c.startsWith("ml-") || 
        c.startsWith("mr-") || 
        c.startsWith("mx-") || 
        c.startsWith("my-") ||
        c === "hidden" ||
        c === "block" ||
        c === "inline-block" ||
        c === "flex-shrink-0" ||
        c === "flex-grow-0"
      ) {
        layoutClasses.push(c);
      } else {
        stylingClasses.push(c);
      }
    });

    const wrapperClass = cn("flex flex-col", layoutClasses.join(" "));
    
    const inputContainerClass = cn(
      "flex items-center w-full border bg-background text-sm ring-offset-background transition-colors duration-200",
      "focus-within:outline-none focus-within:ring-0 focus-within:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Default padding and height if not overridden by parent custom class
      !stylingClasses.some(c => c.startsWith("h-")) && "h-10",
      !stylingClasses.some(c => c.startsWith("rounded-")) && "rounded-lg",
      !stylingClasses.some(c => c.startsWith("px-") || c.startsWith("pl-") || c.startsWith("pr-") || c === "p-") && "px-3",
      // Custom styling classes (like rounded-full, px-4, h-12, etc.)
      stylingClasses.join(" "),
      error && "border-destructive focus-within:ring-destructive"
    );

    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex-1 w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-sm placeholder:text-muted-foreground/60 disabled:cursor-not-allowed",
          type === "password" && "font-sans" // ensure password bullet dots look uniform
        )}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    );

    if (label && labelPlacement === "inside") {
      return (
        <div className={wrapperClass}>
          <div
            className={cn(
              "flex w-full flex-col border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              !stylingClasses.some(c => c.startsWith("rounded-")) && "rounded-lg",
              stylingClasses.filter(c => c.startsWith("rounded-")).join(" "),
              error && "border-destructive focus-within:ring-destructive",
            )}
          >
            <p className="text-xs uppercase text-muted-foreground" style={{ letterSpacing: '-0.8px' }}>
              {label}
            </p>
            <div className="flex items-center w-full mt-1">
              {startContent && <div className="flex items-center shrink-0 mr-2">{startContent}</div>}
              {inputElement}
              {endContent && <div className="flex items-center shrink-0 ml-2">{endContent}</div>}
            </div>
          </div>
          <div className="min-h-[1.25rem]">
            {error && (
              <p className="mt-1 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={wrapperClass}>
        {label && (
          <p
            className="mb-2 text-sm font-medium text-gray-900"
            style={{ letterSpacing: "-0.8px" }}
          >
            {label}
          </p>
        )}
        <div className={inputContainerClass}>
          {startContent && <div className="flex items-center shrink-0 mr-2">{startContent}</div>}
          {inputElement}
          {endContent && <div className="flex items-center shrink-0 ml-2">{endContent}</div>}
        </div>
        <div className="min-h-[1.25rem]">
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
      </div>
    );
  }
)
Input.displayName = "Input"

export { Input }
