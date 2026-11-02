<template>
  <div ref="chartContainer" role="img" :aria-label="ariaLabel" />
</template>
 
<script setup lang="ts">
import Plotly from "plotly.js-dist-min";

import { tailwindColours } from "~/helpers/colourUtils";
import type { TrendPoint } from "~/interfaces/charts";

const props = defineProps<{
  points: TrendPoint[];
  title?: string | null;
}>();
 
const chartContainer = ref<HTMLElement>();

interface SeriesGroup {
  name: string;
  match: (prePost: string | null) => boolean;
  colour: string;
  symbol: string;
}

// How each pre/post group is drawn. Labels and colours match BadgePrePost in the table;
// marker shapes differ too, so colour isn't the only way to tell them apart.
// N/A and Unknown come first so pre/post points are drawn on top when they overlap.
const groups: SeriesGroup[] = [
  {
    name: "N/A",
    match: (prePost) => prePost === "NA",
    colour: tailwindColours.gray[500],
    symbol: "diamond",
  },
  {
    name: "Unknown",
    match: (prePost) => prePost !== "PRE" && prePost !== "POST" && prePost !== "NA",
    colour: tailwindColours.gray[400],
    symbol: "triangle-up",
  },
  {
    name: "Pre-Dialysis",
    match: (prePost) => prePost === "PRE",
    colour: tailwindColours.red[500],
    symbol: "circle",
  },
  {
    name: "Post-Dialysis",
    match: (prePost) => prePost === "POST",
    colour: tailwindColours.blue[500],
    symbol: "square",
  },
];
 
const units = computed(() => props.points.find((point) => point.units)?.units ?? "");
 
const ariaLabel = computed(
  () => `Line chart of ${props.title ?? "values"} over time, ${props.points.length} values`,
);

function buildTraces(): Plotly.Data[] {
  const traces: Plotly.Data[] = [];
  for (const group of groups) {
    const groupPoints = props.points.filter((point) => group.match(point.prePost));
    if (groupPoints.length === 0) continue;
 
    traces.push({
      name: group.name,
      x: groupPoints.map((point) => point.time),
      y: groupPoints.map((point) => point.value),
      type: "scatter",
      mode: "lines+markers",
      line: { color: group.colour, width: 2 },
      marker: { color: group.colour, symbol: group.symbol, size: 7 },
      hovertemplate: `<b>${group.name}</b><br>%{x|%d/%m/%Y %H:%M}<br>%{y} ${units.value}<extra></extra>`,
    });
  }
  return traces;
}
 
function buildLayout(): Partial<Plotly.Layout> {
  return {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: 1.11,
      yanchor: "bottom",
      font: { size: 12 },
      title: {
        text: "Pre/Post-Dialysis",
        side: "top",
        font: { size: 12, color: tailwindColours.gray[600] },
      },
    },
    margin: { l: 60, t: 70, r: 10, b: 40 },
    xaxis: { type: "date", fixedrange: true },
    yaxis: {
      title: { text: units.value, font: { size: 12, color: tailwindColours.gray[600] } },
      fixedrange: true,
    },
  };
}
 
function draw() {
  if (!chartContainer.value) return;
  Plotly.react(chartContainer.value, buildTraces(), buildLayout(), { responsive: true });
}

onMounted(draw);

watch(() => props.points, draw);
 
onBeforeUnmount(() => {
  if (chartContainer.value) Plotly.purge(chartContainer.value);
});
</script>