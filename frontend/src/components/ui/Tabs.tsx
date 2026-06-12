import * as Primitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/utils";

export const Tabs = Primitive.Root;

export function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={cn("flex w-full gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn("flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-500 transition hover:text-zinc-200 data-[state=active]:bg-white/10 data-[state=active]:text-white", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentPropsWithoutRef<typeof Primitive.Content>) {
  return <Primitive.Content className={cn("mt-5 outline-none", className)} {...props} />;
}
