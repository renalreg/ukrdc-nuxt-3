<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h2 class="mb-2">RADAR Missing Data Report</h2>
      <p>List of patients with missing RADAR data elements required for national reporting.</p>
      <p v-if="records" class="mt-2">
        <b>{{ total }}</b> records currently match this condition.
      </p>
    </div>

    <!-- If loading -->
    <div v-if="fetchInProgress">
      <UCard :ui="{ body: { padding: '' } }">
        <!-- Skeleton results -->
        <ul class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 10" :key="n" />
        </ul>
      </UCard>
    </div>
    <div v-else>
      <UCard :ui="{ body: { padding: '' } }">
        <!-- Real results -->
        <ul class="divide-y divide-gray-300">
          <li v-for="record in records" :key="`record-${record.pid}`" class="hover:bg-gray-50">
            <PatientRecordsListItem
              :item="record"
              :show-manage-menu="false"
              :show-sender="false"
              :prefer-ni-over-mrn="true"
            />
          </li>
        </ul>

        <template #footer>
          <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
        </template>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema, type RadarMissingPagePatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import PatientRecordsListItem from "~/components/patientrecord/PatientRecordsListItem.vue";
import usePagination from "~/composables/query/usePagination";
import useApi from "~/composables/useApi";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BasePaginator,
    PatientRecordsListItem,
  },
  props: {
    facility: {
      type: Object as () => FacilityDetailsSchema,
      required: true,
    },
  },
  setup(props) {
    const { page, total, size } = usePagination();
    const { facilitiesApi } = useApi();

    // Data refs
    const fetchInProgress = ref(false);
    const records = ref<RadarMissingPagePatientRecordSummarySchema["items"]>();

    // Data fetching
    function getRecords() {
      fetchInProgress.value = true;

      facilitiesApi
        .getFacilityRadarMissing({
          code: props.facility.id,
          page: page.value ?? 1,
          size: size.value,
        })
        .then((response: { data: RadarMissingPagePatientRecordSummarySchema }) => {
          const data: RadarMissingPagePatientRecordSummarySchema = response.data;
          records.value = data.items;
          total.value = data.total ?? 0;
          page.value = data.page ?? 0;
          size.value = data.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          fetchInProgress.value = false;
        });
    }

    onMounted(() => {
      getRecords();
    });

    watch(page, () => {
      getRecords();
    });

    return {
      records,
      fetchInProgress,
      page,
      total,
      size,
    };
  },
});
</script>
