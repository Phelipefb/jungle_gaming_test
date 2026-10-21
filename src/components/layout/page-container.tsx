import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = ComponentProps<"div"> & {
  variant?: "default" | "mobile";
};

export function PageContainer({
  variant = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-[calc(100%-3rem)]",
        variant === "mobile" ? "max-w-[366px]" : "max-w-[1200px]",
        className,
      )}
      {...props}
    />
  );
}
