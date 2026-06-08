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
          placeholder="Select a coding standard"
        />
        <UButton class="ml-2" size="lg" label="Clear" @click="selectedCode = undefined" />
      </div>

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
import usePagination from "~/composables/query/usePagination";
import useQuery from "~/composables/query/useQuery";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BasePaginator,
    BadgePrePost,
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

    onMounted(() => {
      fetchObservations();
    });

    watch([page, selectedCode], () => {
      fetchObservations();
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
    };
  },
});
</script>
