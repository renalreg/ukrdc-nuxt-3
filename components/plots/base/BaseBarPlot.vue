<template>
  <div :id="id" :class="{ 'mb-2': !!xLabel }"></div>
</template>

<script lang="ts">
import Plotly from "plotly.js-dist-min";

import { plotColours, tailwindColours } from "~/helpers/colourUtils";

export default defineComponent({
  props: {
    x: {
      type: Array,
      default: null,
    },
    y: {
      type: Array,
      default: null,
    },
    xLabel: {
      type: String,
      default: null,
    },
    yLabel: {
      type: String,
      default: null,
    },
    xType: {
      // See https://plotly.com/javascript/reference/layout/xaxis/#layout-xaxis-type
      type: String,
      default: "-",
    },
    yType: {
      // See https://plotly.com/javascript/reference/layout/yaxis/#layout-yaxis-type
      type: String,
      default: "-",
    },
    hoverinfo: {
      type: String,
      required: false,
      default: undefined,
    },
    hovertemplate: {
      // Note https://community.plotly.com/t/remove-trace-0-next-to-hover/33731/2
      type: String,
      required: false,
      default: "<extra></extra>",
    },
    fixedrange: {
      type: Boolean,
      required: false,
      default: true,
    },
    orientation: {
      type: String as () => "v" | "h",
      required: false,
      default: "v",
    },
    id: {
      type: String,
      default: "bar",
    },
  },

  setup(props) {
    const buildData = (): Plotly.Data[] => [
      {
        x: (props.orientation === "h" ? props.y : props.x) as number[] | string[],
        y: (props.orientation === "h" ? props.x : props.y) as number[],
        type: "bar",
        orientation: props.orientation as "v" | "h",
        marker: {
          color: plotColours[0],
          opacity: 0.9,
          line: {
            color: plotColours[0],
            width: 1,
          },
        },
        hoverinfo: props.hoverinfo as Plotly.PlotData["hoverinfo"],
        hovertemplate: props.hovertemplate,
      },
    ];

    const buildLayout = () => ({
      autosize: true,
      bargap: 0.3,
      margin: { t: 10, r: 10, b: 20, l: 20 },
      xaxis: {
        title: props.orientation === "h" ? props.yLabel : props.xLabel,
        type: (props.orientation === "h" ? props.yType : props.xType) as Plotly.AxisType,
        fixedrange: props.fixedrange,
        automargin: true,
        titlefont: {
          size: 12,
          color: tailwindColours.gray[600],
        },
      },
      yaxis: {
        title: props.orientation === "h" ? props.xLabel : props.yLabel,
        type: (props.orientation === "h" ? props.xType : props.yType) as Plotly.AxisType,
        fixedrange: props.fixedrange,
        automargin: true,
        titlefont: {
          size: 12,
          color: tailwindColours.gray[600],
        },
      },
    });

    const config = { responsive: true } as Partial<Plotly.Config>;
    let hasPlotted = false;

    const render = () => {
      const data = buildData();
      const layout = buildLayout();
      if (hasPlotted) {
        Plotly.react(props.id, data, layout, config);
      } else {
        Plotly.newPlot(props.id, data, layout, config);
        hasPlotted = true;
      }
    };

    onMounted(() => {
      render();
    });

    watch(
      [
        () => props.x,
        () => props.y,
        () => props.xLabel,
        () => props.yLabel,
        () => props.xType,
        () => props.yType,
        () => props.fixedrange,
        () => props.orientation,
        () => props.hoverinfo,
        () => props.hovertemplate,
      ],
      () => {
        render();
      },
      { deep: false },
    );
  },
});
</script>
