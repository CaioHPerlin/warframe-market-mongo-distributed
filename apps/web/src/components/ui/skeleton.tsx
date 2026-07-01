import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        "animate-shimmer",
        "bg-[linear-gradient(90deg,color-mix(in_oklch,var(--muted),transparent_0%)_0%,color-mix(in_oklch,var(--muted),white_6%)_50%,color-mix(in_oklch,var(--muted),transparent_0%)_100%)]",
        "bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
