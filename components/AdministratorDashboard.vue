<!--
Admin (permission ukrdc:facilities:*) dashboard with overview of all facilities.
-->

<template>
  <div>
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-users" class="h-6 w-6 text-gray-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <h5>Total Patients</h5>
            <h1 v-if="counts" class="text-green-600">
              {{ counts.distinctPatients }}
            </h1>
            <USkeleton v-else class="h-8 w-24" />
          </div>
        </div>
        <template #footer>
          <p class="text-sm text-gray-600">Total distinct UKRDC IDs in the database</p>
        </template>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-link" class="h-6 w-6 text-gray-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <h5>Open Work Items</h5>
            <h1 v-if="counts" :class="counts.openWorkitems > 0 ? 'text-yellow-600' : 'text-green-600'">
              {{ counts.openWorkitems }}
            </h1>
            <USkeleton v-else class="h-8 w-24" />
          </div>
        </div>
        <template #footer>
          <p class="text-sm text-gray-600">Work Items currently open and uninvestigated</p>
        </template>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-gray-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <h5>Active Failing Records</h5>
            <h1 v-if="counts" :class="counts.patientsReceivingErrors > 0 ? 'text-red-600' : 'text-green-600'">
              {{ counts.patientsReceivingErrors }}
            </h1>
            <USkeleton v-else class="h-8 w-24" />
          </div>
        </div>
        <template #footer>
          <p class="text-sm text-gray-600">Active records currently failing due to errors</p>
        </template>
      </UCard>
    </div>
    <!-- Graphs -->
    <div class="flex flex-col gap-4">
      <!-- Error history -->
      <UCard>
        <template #header>
          <h2>Error History</h2>
        </template>
        <BaseTimeSeriesLinePlot
          v-if="errorsHistory"
          id="error-history-time-series"
          class="h-64"
          :x="errorsHistoryData.x"
          :y="errorsHistoryData.y"
          y-label="New Errors"
          hovertemplate="<b>%{x}</b><br>New errors: %{y}<extra></extra>"
          @click="errorHistoryPointClickHandler"
        />
        <USkeleton v-else class="h-64 w-full" />
      </UCard>

      <!-- WorkItems history -->
      <UCard>
        <template #header>
          <h2>Work Items History</h2>
        </template>
        <BaseTimeSeriesLinePlot
          v-if="workitemsHistory"
          id="workitem-history-time-series"
          class="h-64"
          :x="workitemsHistoryData.x"
          :y="workitemsHistoryData.y"
          y-label="New Work Items"
          hovertemplate="<b>%{x}</b><br>New work items: %{y}<extra></extra>"
          @click="workitemHistoryPointClickHandler"
        />
        <USkeleton v-else class="h-64 w-full" />
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import { type AdminCountsSchema, type HistoryPoint } from "@ukkidney/ukrdc-axios-ts";
import { type PlotDatum } from "plotly.js-dist-min";

import BaseTimeSeriesLinePlot from "~/components/plots/base/BaseTimeSeriesLinePlot.vue";
import useApi from "~/composables/useApi";
import { getPointDateRange, unpackHistoryPoints } from "~/helpers/chartUtils";

export default defineComponent({
  components: {
    BaseTimeSeriesLinePlot,
  },
  setup() {
    const router = useRouter();
    const { adminApi } = useApi();

    const counts = ref<AdminCountsSchema>();

    // Errors history
    const errorsHistory = ref<HistoryPoint[]>();
    const errorsHistoryData = computed(() => {
      return unpackHistoryPoints(errorsHistory.value ?? []);
    });

    // Work item history
    const workitemsHistory = ref<HistoryPoint[]>();
    const workitemsHistoryData = computed(() => {
      return unpackHistoryPoints(workitemsHistory.value ?? []);
    });

    // History plot click handler

    function errorHistoryPointClickHandler(point: PlotDatum) {
      if (point.x) {
        const pointRange = getPointDateRange(point.x as string);
        router.push({
          path: "/messages",
          query: {
            since: pointRange.since,
            until: pointRange.until,
            status: ["ERROR", "RESOLVED"],
          },
        });
      }
    }

    function workitemHistoryPointClickHandler(point: PlotDatum) {
      if (point.x) {
        const pointRange = getPointDateRange(point.x as string);
        router.push({
          path: "/workitems",
          query: {
            since: pointRange.since,
            until: pointRange.until,
          },
        });
      }
    }

    // Data fetching

    function fetchAdminDashboard() {
      adminApi
        .getFullWorkitemHistory()
        .then((response) => {
          workitemsHistory.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      adminApi
        .getFullErrorsHistory()
        .then((response) => {
          errorsHistory.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      adminApi
        .getAdminCounts()
        .then((response) => {
          counts.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    onMounted(() => {
      fetchAdminDashboard();
    });

    return {
      errorsHistory,
      errorsHistoryData,
      workitemsHistory,
      workitemsHistoryData,
      counts,
      errorHistoryPointClickHandler,
      workitemHistoryPointClickHandler,
    };
  },
});
</script>
