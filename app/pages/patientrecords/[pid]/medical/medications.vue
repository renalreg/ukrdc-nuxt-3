<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :data="medications" :columns="columns" class="sensitive">
        <!-- Dose -->
        <template #dosequantity-data="{ row }">
          <span> {{ row.original.dosequantity }} {{ row.original.doseuomcode ?? row.original.doseuomdesc }} </span>
        </template>

        <!-- Frequency -->
        <template #frequency-data="{ row }">
          {{ row.original.frequency ? row.original.frequency.replace(/_/g, " ") : "Unknown" }}
        </template>

        <!-- Route -->
        <template #routecode-data="{ row }">
          <CodeTitle
            v-if="row.original.routecode || row.original.routecodestd"
            :code="row.original.routecode || 'Unknown'"
            :coding-standard="row.original.routecodestd"
          />
        </template>

        <!-- Start Date -->
        <template #fromTime-data="{ row }">
          {{ row.original.fromTime ? formatDate(row.original.fromTime, false) : "None" }}
        </template>

        <!-- End Date -->
        <template #toTime-data="{ row }">
          <span v-if="row.original.toTime">
            {{ formatDate(row.original.toTime, false) }}
          </span>
          <span v-else class="inline-block rounded-sm bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800"
            >Active</span
          >
        </template>

        <!-- Comment -->
        <template #comment-data="{ row }">
          <div v-if="row.original.comment">
            <UPopover>
              <UButton color="white" label="Show" size="xs" />
              <template #content>
                <div class="p-4">
                  {{ row.original.comment }}
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
import type { TableColumn } from "@nuxt/ui";
import type { MedicationSchema, PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import CodeTitle from "~/components/CodeTitle.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";
import { getSortableHeader } from "~/helpers/tableSortHeader";

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

    const columns: TableColumn<MedicationSchema>[] = [
      {
        id: "drugProductGeneric",
        accessorKey: "drugProductGeneric",
        header: "Medication",
      },
      {
        id: "dosequantity",
        accessorKey: "dosequantity",
        header: "Dose",
      },
      {
        id: "frequency",
        accessorKey: "frequency",
        header: "Frequency",
      },
      {
        id: "routecode",
        accessorKey: "routecode",
        header: "Route",
      },
      {
        id: "fromTime",
        accessorKey: "fromTime",
        header: ({ column }) => getSortableHeader(column, "Start Date"),
        enableSorting: true,
      },
      {
        id: "toTime",
        accessorKey: "toTime",
        header: ({ column }) => getSortableHeader(column, "End Date"),
        enableSorting: true,
      },
      {
        id: "comment",
        accessorKey: "comment",
        header: "Comment",
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
