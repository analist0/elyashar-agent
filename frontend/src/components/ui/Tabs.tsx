import * as Primitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/utils";

export const Tabs = Primitive.Root;

export function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={cn("scrollbar-none flex w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.035] p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn("min-w-fit flex-1 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 transition duration-300 hover:text-zinc-200 data-[state=active]:bg-accent data-[state=active]:text-zinc-950", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Content>) {
  return <Primitive.Content className={cn("mt-5 outline-none", className)} {...props} />;
}
