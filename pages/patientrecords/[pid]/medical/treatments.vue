<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :rows="treatments" :columns="columns" class="sensitive">
        <!-- Facility / QBL05 -->
        <template #healthcarefacilitycode-data="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.healthcarefacilitycode" />
            <span v-if="row.qbl05" class="inline">/ {{ row.qbl05 }}</span>
          </span>
        </template>
        <!-- Admit Date -->
        <template #fromtime-data="{ row }">
          {{ row.fromtime ? formatDate(row.fromtime, false) : "None" }}
        </template>
        <!-- Admit Reason -->
        <template #admitreasoncode-data="{ row }">
          <span class="truncate">
            <CodeTitle
              v-if="row.admitreasoncodestd && row.admitreasoncode"
              :coding-standard="row.admitreasoncodestd"
              :code="row.admitreasoncode"
            />
            <p v-if="row.admitreasondesc">{{ row.admitreasondesc }}</p>
          </span>
        </template>
        <!-- Discharge Date -->
        <template #totime-data="{ row }">
          {{ row.totime ? formatDate(row.totime, false) : "None" }}
        </template>
        <!-- Discharge Reason -->
        <template #dischargereasoncode-data="{ row }">
          <span>
            <CodeTitle
              v-if="row.dischargereasoncodestd && row.dischargereasoncode"
              :coding-standard="row.dischargereasoncodestd"
              :code="row.dischargereasoncode"
            />
            <p v-if="row.dischargereasondesc">{{ row.dischargereasondesc }}</p>
            <p v-if="!row.dischargereasondesc && !(row.dischargereasoncodestd && row.dischargereasoncode)">None</p>
          </span>
        </template>
        <!-- Extra info -->
        <template #info-data="{ row }">
          <span>
            <BaseInfoTooltip>
              <div class="sensitive">
                <p><b>ID: </b>{{ row.id }}</p>
                <br />
                <p><b>Admit reason code: </b>{{ row.admitreasoncodestd }} / {{ row.admitreasoncode }}</p>
                <p>
                  <b>Discharge reason code: </b>{{ row.dischargereasoncodestd ?? "None" }} /
                  {{ row.dischargereasoncode ?? "None" }}
                </p>
                <br />
                <p>
                  <b>Healthcare facility code: </b>{{ row.healthcarefacilitycodestd ?? "None" }} /
                  {{ row.healthcarefacilitycode ?? "None" }}
                </p>
                <p>
                  <b>Discharge location code: </b>{{ row.dischargelocationcodestd ?? "None" }} /
                  {{ row.dischargelocationcode ?? "None" }}
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
        key: "healthcarefacilitycode",
        label: "Facility / QBL05",
      },
      {
        key: "fromtime",
        label: "Admit Date",
      },
      {
        key: "admitreasoncode",
        label: "Admit reason",
      },
      {
        key: "totime",
        label: "Discharge Date",
      },
      {
        key: "dischargereasoncode",
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
