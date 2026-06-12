import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const variants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-zinc-950 hover:bg-emerald-300",
        secondary: "border border-white/10 bg-white/[0.06] text-white hover:bg-white/10",
        ghost: "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>;

export function Button({ className, size, variant, ...props }: ButtonProps) {
  return <button className={cn(variants({ className, size, variant }))} {...props} />;
}
