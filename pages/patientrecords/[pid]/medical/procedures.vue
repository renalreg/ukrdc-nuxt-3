<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <template #header>
        <h2>Transplants</h2>
      </template>

      <UTable :loading="loadingTransplants" :rows="transplants" :columns="transplantColumns" class="sensitive" :ui="ui">
        <!-- Admit Reason -->
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

        <!-- Procedure Time -->
        <template #proceduretime-data="{ row }">
          {{ row.proceduretime ? formatDate(row.proceduretime, true) : "None" }}
        </template>

        <!-- Entered At -->
        <template #enteredatcode-data="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.enteredatcode" />
            <p v-if="row.enteredatdesc">{{ row.enteredatdesc }}</p>
          </span>
        </template>

        <!-- TRA77 -->
        <template #tra77-data="{ row }">
          {{ row.tra77 ?? "Unknown" }}
        </template>

        <!-- Extra info -->
        <template #info-data="{ row }">
          <span>
            <BaseInfoTooltip>
              <div class="sensitive">
                <p><b>ID: </b>{{ row.id }}</p>
                <br>
                <p><b>Entered by: </b>{{ row.enteredbycodestd }} / {{ row.enteredbycode }} ({{ row.enteredbydesc }})</p>
              </div>
            </BaseInfoTooltip>
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import type { PatientRecordSchema, TransplantSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseInfoTooltip from "~/components/base/BaseInfoTooltip.vue";
import CodeTitle from "~/components/CodeTitle.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    CodeTitle,
    SendingFacilityLink,
    BaseInfoTooltip,
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
    const transplants = ref<TransplantSchema[]>();

    // Data fetching
    const loadingTransplants = ref(false);

    onMounted(() => {
      loadingTransplants.value = true;

      patientRecordsApi
        .getPatientTransplants({
          pid: props.record.pid,
        })
        .then((response) => {
          transplants.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        })
        .finally(() => {
          loadingTransplants.value = false;
        });
    });

    const transplantColumns = [
      {
        id: "proceduretypecode",
        key: "proceduretypecode",
        label: "Procedure Type",
      },
      {
        id: "proceduretime",
        key: "proceduretime",
        label: "Procedure Time",
      },
      {
        id: "enteredatcode",
        key: "enteredatcode",
        label: "Entered At",
      },
      {
        id: "tra77",
        key: "tra77",
        label: "TRA77",
      },
      {
        id: "info",
        key: "info",
      },
    ];

    const ui = {
      th: {
        base: "px-6 py-3",
      },
      td: {
        base: "px-6 py-4 whitespace-nowrap",
      },
    };

    return {
      formatDate,
      loadingTransplants,
      transplants,
      transplantColumns,
      ui,
    };
  },
});
</script>
