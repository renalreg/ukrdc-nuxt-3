<template>
  <div class="sensitive">
    <BaseLoadingContainer :loading="!observations">
      <!-- Code select -->
      <div class="mb-4 flex">
        <USelectMenu
          v-model="selectedCode"
          searchable
          class="flex-1"
          size="lg"
          :options="availableCodes"
          placeholder="Select a coding standard"
        />
        <UButton class="ml-2" size="lg" label="Clear" @click="selectedCode = undefined" />
      </div>

      <UCard :ui="{ body: { padding: '' } }" class="mb-4">
        <UTable :loading="loading" :rows="observations" :columns="columns" class="sensitive">
          <!-- Value -->
          <template #value-data="{ row }"> {{ row.value }} {{ row.valueUnits }} </template>
          <!-- observationTime -->
          <template #observationTime-data="{ row }">
            {{ row.observationTime ? formatDate(row.observationTime) : "No observation time" }}
          </template>
          <!-- prePost -->
          <template #prePost-data="{ row }">
            <BadgePrePost v-if="row.prePost" :pre-post="row.prePost" />
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
import { type ObservationSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts/api";

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
    const selectedCode = stringQuery("code", null, true, true);

    // Data fetching

    const loading = ref(false);

    function fetchObservations() {
      loading.value = true;
      patientRecordsApi
        .getPatientObservations({
          pid: props.record.pid,
          page: page.value || 1,
          size: size.value,
          code: selectedCode.value ? [selectedCode.value] : undefined,
        })
        .then((response) => {
          observations.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
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
        key: "observationCode",
        label: "Type",
      },
      {
        key: "observationValue",
        label: "Value",
      },
      {
        key: "enteredAt",
        label: "Entered at",
      },
      {
        key: "observationTime",
        label: "Entered on",
      },
      {
        key: "prePost",
      },
    ];

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
    };
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-6 py-3;
}
</style>
