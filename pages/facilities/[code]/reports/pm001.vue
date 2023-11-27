<template>
  <div>
    <div class="mx-auto mb-4 max-w-7xl">
      <h2 class="mb-2">PKB Program Membership Report</h2>
      <p>List of patients with no active PKB membership record, preventing outbound data flow to Patients Know Best.</p>
      <p v-if="records">
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

        <BasePaginator
          class="border-t border-gray-200 bg-white"
          :page="page"
          :size="size"
          :total="total"
          @next="page++"
          @prev="page--"
          @jump="page = $event"
        />
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import { type FacilityDetailsSchema, type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

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
    const records = ref<PatientRecordSummarySchema[]>();

    // Data fetching
    function getRecords() {
      fetchInProgress.value = true;

      facilitiesApi
        .getFacilityReportsPm001({
          code: props.facility.id,
          page: page.value || 1,
          size: size.value,
        })
        .then((response) => {
          records.value = response.data.items;
          total.value = response.data.total;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;

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
