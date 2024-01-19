<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :rows="medications" :columns="columns" class="sensitive">
        <!-- Entered At -->
        <template #enteringOrganizationCode-data="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.enteringOrganizationCode" />
            <p v-if="row.enteringOrganizationDescription">{{ row.enteringOrganizationDescription }}</p>
          </span>
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
          <span>
            <div v-if="row.comment" class="flex items-center gap-2">
              <div class="w-32 flex-1 truncate">{{ row.comment }}</div>
              <UPopover>
                <UButton color="white" label="Show" size="xs" />
                <template #panel>
                  <div class="p-4">
                    {{ row.comment }}
                  </div>
                </template>
              </UPopover>
            </div>
            <p v-else>None</p>
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type MedicationSchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    SendingFacilityLink,
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
        key: "enteringOrganizationCode",
        label: "Entered At",
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
