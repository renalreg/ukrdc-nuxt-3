<template>
  <div class="sensitive">
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :rows="treatments" :columns="columns" class="sensitive">
        <!-- Facility / QBL05 -->
        <template #healthCareFacilityCode-data="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.healthCareFacilityCode" />
            <span v-if="row.qbl05" class="inline">/ {{ row.qbl05 }}</span>
          </span>
        </template>
        <!-- Admit Date -->
        <template #fromTime-data="{ row }">
          {{ row.fromTime ? formatDate(row.fromTime, false) : "None" }}
        </template>
        <!-- Admit Reason -->
        <template #admitReasonCode-data="{ row }">
          <span class="truncate">
            <CodeTitle
              v-if="row.admitReasonCodeStd && row.admitReasonCode"
              :coding-standard="row.admitReasonCodeStd"
              :code="row.admitReasonCode"
            />
            <p v-if="row.admitReasonDesc">{{ row.admitReasonDesc }}</p>
          </span>
        </template>
        <!-- Discharge Date -->
        <template #toTime-data="{ row }">
          {{ row.toTime ? formatDate(row.toTime, false) : "None" }}
        </template>
        <!-- Discharge Reason -->
        <template #dischargeReasonCode-data="{ row }">
          <span>
            <CodeTitle
              v-if="row.dischargeReasonCodeStd && row.dischargeReasonCode"
              :coding-standard="row.dischargeReasonCodeStd"
              :code="row.dischargeReasonCode"
            />
            <p v-if="row.dischargeReasonDesc">{{ row.dischargeReasonDesc }}</p>
            <p v-if="!row.dischargeReasonDesc && !(row.dischargeReasonCodeStd && row.dischargeReasonCode)">None</p>
          </span>
        </template>
        <!-- Extra info -->
        <template #info-data="{ row }">
          <span>
            <BaseInfoTooltip>
              <div class="sensitive">
                <p><b>ID: </b>{{ row.id }}</p>
                <br />
                <p><b>Admit reason code: </b>{{ row.admitReasonCodeStd }} / {{ row.admitReasonCode }}</p>
                <p>
                  <b>Discharge reason code: </b>{{ row.dischargeReasonCodeStd ?? "None" }} /
                  {{ row.dischargeReasonCode ?? "None" }}
                </p>
                <br />
                <p>
                  <b>Healthcare facility code: </b>{{ row.healthCareFacilityCodeStd ?? "None" }} /
                  {{ row.healthCareFacilityCode ?? "None" }}
                </p>
                <p>
                  <b>Discharge location code: </b>{{ row.dischargeLocationCodeStd ?? "None" }} /
                  {{ row.dischargeLocationCode ?? "None" }}
                </p>
              </div>
            </BaseInfoTooltip>
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSchema, type TreatmentSchema } from "@ukkidney/ukrdc-axios-ts";

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
    const treatments = ref<TreatmentSchema[]>();

    // Data fetching
    const loading = ref(false);
    onMounted(() => {
      loading.value = true;
      patientRecordsApi
        .getPatientTreatments({
          pid: props.record.pid,
        })
        .then((response) => {
          treatments.value = response.data;
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
        key: "healthCareFacilityCode",
        label: "Facility / QBL05",
      },
      {
        key: "fromTime",
        label: "Admit Date",
      },
      {
        key: "admitReasonCode",
        label: "Admit reason",
      },
      {
        key: "toTime",
        label: "Discharge Date",
      },
      {
        key: "dischargeReasonCode",
        label: "Discharge reason",
      },
      {
        key: "info",
      },
    ];

    return {
      formatDate,
      loading,
      treatments,
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
