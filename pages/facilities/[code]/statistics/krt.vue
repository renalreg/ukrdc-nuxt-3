<template>
  <div>
    <UCard class="mb-6">
      <DateRangeSelector 
        class="mr-4" 
        @date-range-updated="handleDateRangeUpdate"
      />
    </UCard>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Labelled2dPiePlot
        id="prevalentKRTModalities"
        :labelled2d="facilityStatsKrt?.all.prevalentKrt"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsKrt?.all.prevalentKrt.metadata?.populationSize?.toString()"
      />
      <Labelled2dPiePlot
        :labelled2d="facilityStatsKrt?.all.incidentKrt"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsKrt?.all.incidentKrt.metadata?.populationSize?.toString()"
      />
    </div>

    <br />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Labelled2dBarPlot
        id="incentreDialysisFrequencyPlot"
        :labelled2d="facilityStatsKrt?.all.incentreDialysisFrequency"
        :export-file-name="`incentre-dialysis-freq-${facility.id}`"
        hovertemplate="Days per week: <b>%{x}</b><br>%{y}<extra></extra>"
        orientation="h"
        x-type="category"
      />
      <Labelled2dPiePlot
        id="incidentInitialAccessPlot"
        :labelled2d="facilityStatsKrt?.all.incidentInitialAccess"
        :export-file-name="`incident-initial-access-${facility.id}`"
        :text="facilityStatsKrt?.all.incidentInitialAccess?.metadata?.populationSize?.toString()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  type FacilityDetailsSchema,
  type FacilityExtractsSchema,
  type UnitLevelKRTStats,
} from "@ukkidney/ukrdc-axios-ts";
import { DateTime } from "luxon";

import DateRangeSelector from "~/components/plots/stats/DateRangeSelector.vue";
import Labelled2dBarPlot from "~/components/plots/stats/Labelled2dBarPlot.vue";
import Labelled2dPiePlot from "~/components/plots/stats/Labelled2dPiePlot.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    Labelled2dBarPlot,
    Labelled2dPiePlot,
    DateRangeSelector
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
    const facilityStatsKrt = ref<UnitLevelKRTStats>();
    const dateRange = ref({
      fromTime: new Date(),
      toTime: new Date(),
      timePeriod: '90 days',
      isNow: true
    });

    // Data fetching function
    let requestSeq = 0;
    const fetchFacilityStats = async (fromDate?: Date, toDate?: Date) => {
      const seq = ++requestSeq;
      try {
        const response = await facilitiesApi.getFacilityStatsKrt({
          code: props.facility.id,
          since: fromDate ? DateTime.fromJSDate(fromDate).toISODate()! : undefined,
          until: toDate ? DateTime.fromJSDate(toDate).toISODate()! : undefined,
        });
        if (seq === requestSeq) {
          facilityStatsKrt.value = response.data;
        }
      } catch (error) {
        console.error('Failed to fetch facility stats:', error);
      }
    };

    // Handle date range updates from the selector
    const handleDateRangeUpdate = (newDateRange: {
      fromTime: Date;
      toTime: Date;
      timePeriod: string;
      isNow: boolean;
    }) => {
      dateRange.value = newDateRange;
      fetchFacilityStats(newDateRange.fromTime, newDateRange.toTime);
    };

    // Initial data fetch handled by DateRangeSelector's immediate emit
    onMounted(() => {});

    return {
      facilityStatsKrt,
      dateRange,
      handleDateRangeUpdate,
      formatDate,
    };
  },
});
</script>