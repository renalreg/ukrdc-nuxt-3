<template>
  <div>
    <UCard class="mb-6">
      <div v-if="facilityStatsDialysis">
        Statistics calculated from
        {{ formatDate(facilityStatsDialysis.all.metadata.fromTime) }} to
        {{ formatDate(facilityStatsDialysis.all.metadata.toTime) }}
      </div>
      <USkeleton v-else class="h-8 w-2/3" />
    </UCard>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Labelled2dPiePlot
        id="prevalentKRTModalities"
        :labelled2d="facilityStatsDialysis?.all.prevalentKrt"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsDialysis?.all.prevalentKrt.metadata?.populationSize?.toString()"
      />
      <Labelled2dPiePlot
        :labelled2d="facilityStatsDialysis?.all.incidentKrt"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsDialysis?.all.incidentKrt.metadata?.populationSize?.toString()"
      />
    </div>

    <br />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Labelled2dBarPlot
        id="incentreDialysisFrequencyPlot"
        :labelled2d="facilityStatsDialysis?.all.incentreDialysisFrequency"
        :export-file-name="`incentre-dialysis-freq-${facility.id}`"
        hovertemplate="Days per week: <b>%{x}</b><br>%{y}<extra></extra>"
        orientation="h"
        x-type="category"
      />
      <Labelled2dPiePlot
        id="incidentInitialAccessPlot"
        :labelled2d="facilityStatsDialysis?.all.incidentInitialAccess"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsDialysis?.all.incidentInitialAccess?.metadata?.populationSize?.toString()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  type FacilityDetailsSchema,
  type FacilityExtractsSchema,
  type UnitLevelDialysisStats,
} from "@ukkidney/ukrdc-axios-ts";

import Labelled2dBarPlot from "~/components/plots/stats/Labelled2dBarPlot.vue";
import Labelled2dPiePlot from "~/components/plots/stats/Labelled2dPiePlot.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    Labelled2dBarPlot,
    Labelled2dPiePlot,
  },
  props: {
    facility: {
      type: Object as () => FacilityDetailsSchema,
      required: true,
    },
    extracts: {
      type: Object as () => FacilityExtractsSchema,
      required: true,
    },
  },

  setup(props) {
    const { facilitiesApi } = useApi();

    // Data refs
    const facilityStatsDialysis = ref<UnitLevelDialysisStats>();

    // Data fetching
    onMounted(() => {
      facilitiesApi
        .getFacilityStatsKrt({
          code: props.facility.id,
        })
        .then((response) => {
          console.log("facilityStatsDialysis API response:", response.data); 
          facilityStatsDialysis.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    return {
      facilityStatsDialysis,
      formatDate,
    };
  },
});
</script>
