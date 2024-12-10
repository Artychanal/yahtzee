import * as React from "react"
import { cn } from "../../lib/utils.ts"
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
      "px-4 py-2 h-10",
      "disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))

export { Button }