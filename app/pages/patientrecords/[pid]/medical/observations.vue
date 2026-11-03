<template>
  <div>
    <BaseLoadingContainer :loading="!observations">
      <!-- Code select -->
      <div class="mb-4 flex">
        <USelectMenu
          v-model="selectedCode"
          class="flex-1"
          size="lg"
          :items="availableCodes"
          placeholder="Select a coding standard type to see its values and chart"
        />
        <UButton class="ml-2" size="lg" label="Clear" @click="selectedCode = undefined" />
      </div>

      <!-- Trend chart for the selected observation code -->
      <UCard v-if="selectedCode" class="mb-4">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-highlighted text-sm font-semibold tracking-wide uppercase">
              {{ chartTitle }}
            </h2>
            <UButton
              class="w-[103px] justify-center"
              color="neutral"
              variant="ghost"
              :icon="chartVisible ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
              :label="chartVisible ? 'Hide chart' : 'Show chart'"
              :aria-expanded="chartVisible"
              @click="chartVisible = !chartVisible"
            />
          </div>
        </template>

        <template v-if="chartVisible" #default>
          <USkeleton v-if="trendLoading" class="h-72 w-full" />
          <p v-else-if="trendPoints.length === 0" class="text-muted py-8 text-center text-sm">
            No numeric values to chart
          </p>
          <div v-else>
            <PatientRecordTrendPlot class="h-72" :points="trendPoints" :title="chartTitle" />
            <p v-if="trendSkipped > 0" class="text-muted mt-2 text-sm">
              {{ trendSkipped }} {{ trendSkipped === 1 ? "observation" : "observations" }} without a numeric value not
              shown (see table)
            </p>
          </div>
        </template>
      </UCard>

      <UCard :ui="{ body: { padding: '' } }" class="mb-4">
        <UTable :loading="loading" :data="observations" :columns="columns" class="sensitive" :ui="ui">
          <!-- Value -->
          <template #value-data="{ row }"> {{ row.original.value }} {{ row.original.valueUnits }} </template>
          <!-- observationTime -->
          <template #observationTime-data="{ row }">
            {{ row.original.observationTime ? formatDate(row.original.observationTime) : "No observation time" }}
          </template>
          <!-- prePost -->
          <template #prePost-data="{ row }">
            <BadgePrePost :pre-post="row.original.prePost" />
          </template>
        </UTable>

        <template #footer>
          <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
        </template>
      </UCard>
    </BaseLoadingContainer>
  </div>
</template>

<script lang="ts">
import type { ObservationSchema, PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts/api";

import BadgePrePost from "~/components/BadgePrePost.vue";
import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import PatientRecordTrendPlot from "~/components/patientrecord/medical/PatientRecordTrendPlot.vue";
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useApi from "~/composables/useApi";
import { toTrendPoints } from "~/helpers/chartUtils";
import { formatDate } from "~/helpers/dateUtils";
import type { TrendPoint } from "~/interfaces/charts";

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BasePaginator,
    BadgePrePost,
    PatientRecordTrendPlot,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const { page, total, size } = usePagination();
    const { stringQuery } = useQuery();
    const { patientRecordsApi } = useApi();

    // Data refs

    const observations = ref<ObservationSchema[]>();

    const availableCodes = ref([] as string[]);
    const selectedCode = stringQuery("code", undefined, true, true);

    // Trend chart
    const chartVisible = ref(true);
    const trendPoints = ref<TrendPoint[]>([]);
    const trendLoading = ref(false);
    // How many observations were left off the chart (no numeric value), so this can be stated under the chart
    const trendSkipped = ref(0);

    const chartTitle = computed(
      () =>
        observations.value?.find((o) => o.observationCode === selectedCode.value)?.observationDesc?.trim() ||
        selectedCode.value ||
        null,
    );

    // Data fetching

    const loading = ref(false);

    function fetchObservations() {
      loading.value = true;
      patientRecordsApi
        .getPatientObservations({
          pid: props.record.pid,
          page: page.value ?? 1,
          size: size.value,
          code: selectedCode.value ? [selectedCode.value] : undefined,
        })
        .then((response) => {
          observations.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          loading.value = false;
        });

      // If we don't already have a list of available codes, fetch one
      if (availableCodes.value && availableCodes.value.length === 0) {
        patientRecordsApi
          .getPatientObservationCodes({
            pid: props.record.pid,
          })
          .then((response) => {
            availableCodes.value = response.data;
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          });
      }
    }

    function fetchTrend() {
      if (!selectedCode.value || !chartVisible.value) {
        trendPoints.value = [];
        trendSkipped.value = 0;
        return;
      }

      trendLoading.value = true;
      patientRecordsApi
        .getPatientObservationTrend({
          pid: props.record.pid,
          code: selectedCode.value,
        })
        .then((response) => {
          trendPoints.value = toTrendPoints(
            response.data.map((item) => ({
              time: item.observationTime,
              value: item.observationValue,
              units: item.observationUnits,
              prePost: item.prePost,
            })),
          );
          // Everything the API returned, minus what could be plotted, is how many were left off the chart
          trendSkipped.value = response.data.length - trendPoints.value.length;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Clear the chart so that a previous observation type's data isn't left showing under the new title.
          trendPoints.value = [];
          trendSkipped.value = 0;
        })
        .finally(() => {
          trendLoading.value = false;
        });
    }

    onMounted(() => {
      fetchObservations();
      fetchTrend();
    });

    watch([page, selectedCode], () => {
      fetchObservations();
    });

    watch(selectedCode, () => {
      chartVisible.value = true;
    });

    watch([selectedCode, chartVisible], () => {
      fetchTrend();
    });

    const columns = [
      {
        id: "observationCode",
        accessorKey: "observationCode",
        header: "Type",
      },
      {
        id: "observationValue",
        accessorKey: "observationValue",
        header: "Value",
      },
      {
        id: "enteredAt",
        accessorKey: "enteredAt",
        header: "Entered at",
      },
      {
        id: "observationTime",
        accessorKey: "observationTime",
        header: "Entered on",
      },
      {
        id: "prePost",
        accessorKey: "prePost",
        header: "Pre/Post-Dialysis",
      },
    ];

    const ui = {
      th: {
        base: "px-6 py-3",
      },
    };

    return {
      page,
      size,
      total,
      loading,
      observations,
      columns,
      availableCodes,
      selectedCode,
      formatDate,
      ui,
      chartVisible,
      chartTitle,
      trendPoints,
      trendLoading,
      trendSkipped,
    };
  },
});
</script>
