import type { Column } from "@tanstack/vue-table";
import { h } from "vue";

import { UButton } from "#components";

export function getSortableHeader<T>(column: Column<T>, label: string) {
  const isSorted = column.getIsSorted();

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
  });
}
