<template>
  <div class="sensitive">
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :rows="sessions" :columns="columns" class="sensitive">
        <!-- Procedure time-->
        <template #proceduretime-data="{ row }">
          {{ row.proceduretime ? formatDate(row.proceduretime) : "None" }}
        </template>
        <!-- Procedure type-->
        <template #proceduretypecode-data="{ row }">
          <span class="truncate">
            <CodeTitle
              v-if="row.proceduretypecodestd && row.proceduretypecode"
              :coding-standard="row.proceduretypecodestd"
              :code="row.proceduretypecode"
            />
            <p v-if="row.proceduretypedesc">{{ row.proceduretypedesc }}</p>
          </span>
        </template>
        <!-- Procedure type-->
        <template #enteredatcode-data="{ row }">
          <span>
            <SendingFacilityLink class="font-medium" :code="row.enteredatcode" />
          </span>
        </template>
        <!-- Extra info -->
        <template #info-data="{ row }">
          <span>
            <BaseInfoTooltip>
              <div class="sensitive">
                <p><b>ID: </b>{{ row.id }}</p>
                <br />
                <p><b>Clinician: </b>{{ row.cliniciandesc ?? row.cliniciancode }}</p>
                <p><b>Entered by: </b>{{ row.enteredbydesc ?? row.enteredbycode }}</p>
              </div>
            </BaseInfoTooltip>
          </span>
        </template>
      </UTable>

      <template #footer>
        <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type DialysisSessionSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseInfoTooltip from "~/components/base/BaseInfoTooltip.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import CodeTitle from "~/components/CodeTitle.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import usePagination from "~/composables/query/usePagination";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseInfoTooltip,
    SendingFacilityLink,
    CodeTitle,
    BasePaginator,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup(props) {
    const { page, total, size } = usePagination();
    const { patientRecordsApi } = useApi();

    // Data refs

    const sessions = ref<DialysisSessionSchema[]>();

    // Data fetching
    const loading = ref(false);
    function fetchResults() {
      loading.value = true;
      patientRecordsApi
        .getPatientDialysisSessions({
          pid: props.record.pid,
          page: page.value ?? 1,
          size: size.value,
        })
        .then((response) => {
          sessions.value = response.data.items;
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
    }

    // Data lifecycle

    onMounted(() => {
      fetchResults();
    });

    watch([page], () => {
      fetchResults();
    });

    const columns = [
      {
        key: "proceduretime",
        label: "Procedure Time",
      },
      {
        key: "proceduretypecode",
        label: "Type",
      },
      {
        key: "enteredatcode",
        label: "Entered At",
      },
      {
        key: "qhd19",
        label: "QHD19",
      },
      {
        key: "qhd20",
        label: "QHD20",
      },
      {
        key: "qhd21",
        label: "QHD21",
      },
      {
        key: "qhd22",
        label: "QHD22",
      },
      {
        key: "qhd30",
        label: "QHD30",
      },
      {
        key: "qhd31",
        label: "QHD31",
      },
      {
        key: "qhd32",
        label: "QHD32",
      },
      {
        key: "qhd33",
        label: "QHD33",
      },
      {
        key: "info",
      },
    ];

    return {
      page,
      size,
      total,
      formatDate,
      loading,
      sessions,
      columns,
    };
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-6 py-3;
}
td {
  @apply whitespace-nowrap px-6 py-4;
}
</style>
