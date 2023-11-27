<template>
  <div>
    <UCard class="mb-6">
        <div v-if="facilityStatsDemographics">
          Demographic statistics calulated from a population of
          <b>{{ facilityStatsDemographics.metadata.population }}</b> patients.
        </div>
        <USkeleton v-else class="h-8 w-1/2" />
    </UCard>

    <Labelled2dBarPlot
      id="ageDistributionPlot"
      :labelled2d="facilityStatsDemographics?.age"
      :export-file-name="`age-distribution-${facility.id}`"
      hovertemplate="Age: <b>%{x}</b><br>%{y}<extra></extra>"
    />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Labelled2dPiePlot
        id="genderDistributionPlot"
        :labelled2d="facilityStatsDemographics?.gender"
        :export-file-name="`gender-distribution-${facility.id}`"
      />
      <Labelled2dPiePlot
        id="ethnicityDistributionPlot"
        :labelled2d="facilityStatsDemographics?.ethnicGroup"
        :export-file-name="`ethnicity-distribution-${facility.id}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { type DemographicsStats, type FacilityDetailsSchema, type FacilityExtractsSchema } from "@ukkidney/ukrdc-axios-ts";

import Labelled2dBarPlot from "~/components/plots/stats/Labelled2dBarPlot.vue";
import Labelled2dPiePlot from "~/components/plots/stats/Labelled2dPiePlot.vue";
import useApi from "~/composables/useApi";

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
    const facilityStatsDemographics = ref<DemographicsStats>();

    // Data fetching
    onMounted(() => {
      facilitiesApi
        .getFacilityStatsDemographics({
          code: props.facility.id,
        })
        .then((response) => {
          facilityStatsDemographics.value = response.data;
        });
    });

    return {
      facilityStatsDemographics,
    };
  },
});
</script>
