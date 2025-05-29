import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface StrengthProgressBarProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  strength: "High" | "Medium" | "Low"
}

const strengthMap = {
  High: { value: 100, color: "bg-green-500" },
  Medium: { value: 60, color: "bg-yellow-500" },
  Low: { value: 30, color: "bg-red-500" },
}

function StrengthProgressBar({
  className,
  strength,
  ...props
}: StrengthProgressBarProps) {
  const { value, color } = strengthMap[strength]

  return (
    <ProgressPrimitive.Root
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          color,
          "h-full w-full flex-1 transition-all"
        )}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { StrengthProgressBar }