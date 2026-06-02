<template>
  <div>
    <!-- Show dashboard alerts for users with only one facility, that is, for whom this page IS their dashboard -->
    <DashboardAlerts v-if="!hasMultipleFacilities" class="mb-4" />

    <div class="mb-2">
      <h1 v-if="facility">{{ facility.description }}</h1>
      <USkeleton v-else class="mb-2 h-8 w-1/4" />
      <h5 v-if="facility">
        {{ facility.id }}
      </h5>
      <USkeleton v-else class="h-4 w-1/2" />
    </div>

    <div class="mb-6">
      <UHorizontalNavigation :links="links" />
    </div>

    <NuxtPage v-if="facility && extracts" :facility="facility" :extracts="extracts" />
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema, type FacilityExtractsSchema } from "@ukkidney/ukrdc-axios-ts";

import DashboardAlerts from "~/components/DashboardAlerts.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { insertIf } from "~/helpers/arrayUtils";
import { getFirstOrValue } from "~/helpers/queryUtils";

export default defineComponent({
  components: {
    DashboardAlerts,
  },
  setup() {
    const route = useRoute();
    const { hasMultipleFacilities, hasPermission } = usePermissions();

    const { facilitiesApi } = useApi();

    // Head
    useHead({
      title: `${route.params.code}`,
    });

    // URL parameters
    const code = computed(() => route.params.code);

    // Data refs
    const facility = ref<FacilityDetailsSchema>();
    const extracts = ref<FacilityExtractsSchema>();

    const showStats = computed<boolean>(() => {
      if (extracts.value) {
        return extracts.value.ukrdc > 0;
      }
      return false;
    });

    // Data fetching

    onMounted(() => {
      facilitiesApi
        .getFacility({
          code: getFirstOrValue(code.value),
        })
        .then((response) => {
          facility.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
      facilitiesApi
        .getFacilityExtracts({
          code: getFirstOrValue(code.value),
        })
        .then((response) => {
          extracts.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    // Navigation
    const links = computed(() => {
      return [
        {
          label: "Overview",
          to: `/facilities/${route.params.code}/overview`,
          icon: "i-heroicons-home",
        },
        {
          label: "Errors",
          to: `/facilities/${route.params.code}/errors`,
          icon: "i-heroicons-exclamation-triangle",
          badge: facility.value ? facility.value.statistics.patientsReceivingMessageError : null,
        },
        ...insertIf(showStats.value, {
          label: "Statistics",
          to: `/facilities/${route.params.code}/statistics`,
          icon: "i-heroicons-chart-pie",
        }),
        ...insertIf(hasPermission("ukrdc:reports:read"), {
          label: "Reports",
          to: `/facilities/${route.params.code}/reports`,
          icon: "i-heroicons-document-chart-bar",
        }),
      ];
    });

    return {
      hasMultipleFacilities,
      links,
      code,
      facility,
      extracts,
    };
  },

  head: {
    title: "Facility",
  },
});
</script>
