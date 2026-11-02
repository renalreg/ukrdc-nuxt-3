import type { HistoryPoint } from "@ukkidney/ukrdc-axios-ts";
import { DateTime } from "luxon";

import type { TrendPoint } from "~/interfaces/NumericChartData";

export function getPointDateRange(dateString: string) {
  const startDate = DateTime.fromISO(dateString);
  const endDate = startDate.plus({ days: 1 });
  return { since: startDate.toISO(), until: endDate.toISO() };
}

export function unpackHistoryPoints(historyPoints: HistoryPoint[]) {
  const x: string[] = [];
  const y: number[] = [];
  historyPoints.forEach((point) => {
    x.push(point.time);
    y.push(point.count);
  });
  return { x, y };
}

export function toTrendPoints(
  items: { time: string; value?: string | null; units?: string | null; prePost?: string | null }[],
): TrendPoint[] {
  return items
    .filter((item) => item.value != null && item.value.trim() !== "" && !Number.isNaN(Number(item.value)))
    .map((item) => ({
      time: item.time,
      value: Number(item.value),
      units: item.units ?? null,
      prePost: item.prePost ?? null,
    }));
}
