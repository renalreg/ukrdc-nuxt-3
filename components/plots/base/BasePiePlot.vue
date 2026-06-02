<template>
  <div :id="id" ref="el"></div>
</template>

<script lang="ts">
import Plotly from "plotly.js-dist-min";

import { plotColours } from "~/helpers/colourUtils";

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
    colors: {
      type: Array,
      default: () => {
        return plotColours;
      },
    },
    legend: {
      type: Boolean,
      default: true,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
    id: {
      type: String,
      default: "doughnut",
    },
  },

  setup(props) {
    const el = ref<HTMLDivElement | null>(null);

    const buildData = (): Plotly.Data[] => [
      {
        values: props.y as number[],
        labels: props.x as string[],
        type: "pie",
        marker: {
          colors: props.colors as string[],
        },
        hoverinfo: "label+value",
        textinfo: "none",
        hole: 0.5,
        opacity: 0.9,
      },
    ];

    const buildLayout = () => ({
      autosize: true,
      margin: { l: 10, t: 10, r: 10, b: 10 },
      showlegend: props.legend,
      legend: {
        x: 1,
        y: 0.5,
      },
      annotations: [
        {
          showarrow: false,
          text: props.text ? props.text : "",
          x: 0.5,
          y: 0.5,
        },
      ],
    });

    const config = { responsive: true } as Partial<Plotly.Config>;
    let hasPlotted = false;

    const render = () => {
      if (!el.value) return;
      const data = buildData();
      const layout = buildLayout();
      if (hasPlotted) {
        Plotly.react(el.value, data, layout, config);
      } else {
        Plotly.newPlot(el.value, data, layout, config);
        hasPlotted = true;
      }
    };

    onMounted(() => {
      render();
    });

    watchEffect(() => {
      render();
    });

    onBeforeUnmount(() => {
      if (el.value) {
        Plotly.purge(el.value);
      }
    });

    return { el };
  },
});
</script>
