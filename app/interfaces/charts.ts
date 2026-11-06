export interface HistoryPointEvent {
  x: number;
  y: number;
}

export interface NumericChartData {
  labels: string[] | number[];
  data: number[];
}

export interface TrendPoint {
  time: string;
  value: number;
  units: string | null;
  prePost: string | null;
}
