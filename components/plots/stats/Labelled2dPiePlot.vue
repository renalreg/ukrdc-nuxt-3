<!-- eslint-disable vue/no-v-html -->
<template>
  <UCard class="mb-4">
    <template #header>
      <div class="flex items-center gap-2">
        <BaseMarkdownDescriptionTooltip
          v-if="labelled2d"
          :description-markdown="labelled2d.metadata.description"
        />
        <div class="flex-1">
          <div class="flex gap-2">
            <h2>{{ labelled2d ? labelled2d.metadata.title : "" }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <h6>{{ labelled2d ? labelled2d.metadata.summary : "" }}</h6>
          </div>
        </div>
        <UButton
          v-if="labelled2d"
          color="white"
          label="Export"
          @click="exportData"
        />
      </div>
    </template>
    <BasePiePlot
      v-if="labelled2d"
      :id="id"
      :x="labelled2d.data.x"
      :y="labelled2d.data.y"
      :text="text"
      class="h-72"
    />
    <SkelePlot v-else />
  </UCard>
</template>

<script lang="ts">
import { type Labelled2d } from "@ukkidney/ukrdc-axios-ts";

import BasePiePlot from "~/components/plots/base/BasePiePlot.vue";
import BaseMarkdownDescriptionTooltip from "~/components/plots/stats/BaseMarkdownDescriptionTooltip.vue";
import SkelePlot from "~/components/plots/stats/SkelePlot.vue";
import { buildCsv } from "~/helpers/exportUtils";
import { saveAs } from "~/helpers/fileUtils";

export default defineComponent({
  components: {
    BasePiePlot,
    SkelePlot,
    BaseMarkdownDescriptionTooltip,
  },
  props: {
    labelled2d: {
      type: Object as () => Labelled2d,
      required: false,
      default: undefined,
    },
    hoverinfo: {
      type: String,
      required: false,
      default: undefined,
    },
    hovertemplate: {
      type: String,
      required: false,
      default: undefined,
    },
    exportFileName: {
      type: String,
      required: false,
      default: "labelled2d-export",
    },
    fixedrange: {
      type: Boolean,
      required: false,
      default: true,
    },
    text: {
      type: String,
      required: false,
      default: null,
    },
    id: {
      type: String,
      default: "bar",
    },
  },

  setup(props) {
    function exportData() {
      const rows: (string | number)[][] = [
        [
          props.labelled2d.metadata.axisTitles?.x || "x",
          props.labelled2d.metadata.axisTitles?.y || "y",
        ],
      ];
      for (let i = 0; i < props.labelled2d.data.x.length; i++) {
        rows.push([
          props.labelled2d.data.x[i],
          props.labelled2d.data.y[i] as number,
        ]);
      }

      const blob = new Blob([buildCsv(rows)], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, `${props.exportFileName}.csv`);
    }

    return {
      exportData,
    };
  },
});
</script>
