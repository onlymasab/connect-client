import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface StockProgressBarProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  stock: number
  minimum: number
}

function StockProgressBar({
  className,
  stock,
  minimum,
  ...props
}: StockProgressBarProps) {
  // Calculate progress percentage
  const percentage = Math.min((stock / minimum) * 100, 100)

  // Determine color based on stock levels
  const color =
    stock === 0
      ? "bg-red-500"
      : percentage < 100
      ? "bg-yellow-500"
      : "bg-green-500"

  return (
    <ProgressPrimitive.Root
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(color, "h-full w-full flex-1 transition-all")}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { StockProgressBar }