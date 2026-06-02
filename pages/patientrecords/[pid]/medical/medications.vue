<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :rows="medications" :columns="columns" class="sensitive">
        <!-- Dose -->
        <template #dosequantity-data="{ row }">
          <span> {{ row.dosequantity }} {{ row.doseuomcode ?? row.doseuomdesc }} </span>
        </template>

        <!-- Frequency -->
        <template #frequency-data="{ row }">
          {{ row.frequency ? row.frequency.replace(/_/g, " ") : "Unknown" }}
        </template>

        <!-- Route -->
        <template #routecode-data="{ row }">
          <CodeTitle
            v-if="row.routecode || row.routecodestd"
            :code="row.routecode || 'Unknown'"
            :coding-standard="row.routecodestd"
          />
        </template>

        <!-- Start Date -->
        <template #fromTime-data="{ row }">
          {{ row.fromTime ? formatDate(row.fromTime, false) : "None" }}
        </template>

        <!-- End Date -->
        <template #toTime-data="{ row }">
          <span v-if="row.toTime">
            {{ formatDate(row.toTime, false) }}
          </span>
          <span v-else class="inline-block rounded-sm bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800"
            >Active</span
          >
        </template>

        <!-- Comment -->
        <template #comment-data="{ row }">
          <div v-if="row.comment">
            <UPopover>
              <UButton color="white" label="Show" size="xs" />
              <template #panel>
                <div class="p-4">
                  {{ row.comment }}
                </div>
              </template>
            </UPopover>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type MedicationSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import CodeTitle from "~/components/CodeTitle.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    CodeTitle,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const { patientRecordsApi } = useApi();

    // Data refs
    const medications = ref<MedicationSchema[]>();

    // Data fetching
    const loading = ref(false);

    onMounted(() => {
      loading.value = true;
      patientRecordsApi
        .getPatientMedications({
          pid: props.record.pid,
        })
        .then((response) => {
          medications.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          loading.value = false;
        });
    });

    const columns = [
      {
        key: "drugProductGeneric",
        label: "Medication",
      },
      {
        key: "dosequantity",
        label: "Dose",
      },
      {
        key: "frequency",
        label: "Frequency",
      },
      {
        key: "routecode",
        label: "Route",
      },
      {
        key: "fromTime",
        label: "Start Date",
        sortable: true,
      },
      {
        key: "toTime",
        label: "End Date",
        sortable: true,
      },
      {
        key: "comment",
        label: "Comment",
      },
    ];

    return {
      formatDate,
      loading,
      medications,
      columns,
    };
  },
});
</script>
