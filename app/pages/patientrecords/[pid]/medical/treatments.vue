<template>
  <div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :data="treatments" :columns="columns" class="sensitive" :ui="ui">
        <!-- Facility / QBL05 -->
        <template #healthcarefacilitycode-cell="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.original.healthcarefacilitycode" />
            <span v-if="row.original.qbl05" class="inline">/ {{ row.original.qbl05 }}</span>
          </span>
        </template>
        <!-- Admit Date -->
        <template #fromtime-cell="{ row }">
          {{ row.original.fromtime ? formatDate(row.original.fromtime, false) : "None" }}
        </template>
        <!-- Admit Reason -->
        <template #admitreasoncode-cell="{ row }">
          <span class="truncate">
            <CodeTitle
              v-if="row.original.admitreasoncodestd && row.original.admitreasoncode"
              :coding-standard="row.original.admitreasoncodestd"
              :code="row.original.admitreasoncode"
            />
            <p v-if="row.original.admitreasondesc">{{ row.original.admitreasondesc }}</p>
          </span>
        </template>
        <!-- Discharge Date -->
        <template #totime-cell="{ row }">
          {{ row.original.totime ? formatDate(row.original.totime, false) : "None" }}
        </template>
        <!-- Discharge Reason -->
        <template #dischargereasoncode-cell="{ row }">
          <span>
            <CodeTitle
              v-if="row.original.dischargereasoncodestd && row.original.dischargereasoncode"
              :coding-standard="row.original.dischargereasoncodestd"
              :code="row.original.dischargereasoncode"
            />
            <p v-if="row.original.dischargereasondesc">{{ row.original.dischargereasondesc }}</p>
            <p
              v-if="
                !row.original.dischargereasondesc &&
                !(row.original.dischargereasoncodestd && row.original.dischargereasoncode)
              "
            >
              None
            </p>
          </span>
        </template>
        <!-- Extra info -->
        <template #info-cell="{ row }">
          <span>
            <BaseInfoTooltip>
              <div class="sensitive">
                <p><b>ID: </b>{{ row.original.id }}</p>
                <br />
                <p>
                  <b>Admit reason code: </b>{{ row.original.admitreasoncodestd }} / {{ row.original.admitreasoncode }}
                </p>
                <p>
                  <b>Discharge reason code: </b>{{ row.original.dischargereasoncodestd ?? "None" }} /
                  {{ row.original.dischargereasoncode ?? "None" }}
                </p>
                <br />
                <p>
                  <b>Healthcare facility code: </b>{{ row.original.healthcarefacilitycodestd ?? "None" }} /
                  {{ row.original.healthcarefacilitycode ?? "None" }}
                </p>
                <p>
                  <b>Discharge location code: </b>{{ row.original.dischargelocationcodestd ?? "None" }} /
                  {{ row.original.dischargelocationcode ?? "None" }}
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
import type { PatientRecordSchema, TreatmentSchema } from "@ukkidney/ukrdc-axios-ts";

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
        id: "healthcarefacilitycode",
        accessorKey: "healthcarefacilitycode",
        header: "Facility / QBL05",
      },
      {
        id: "fromtime",
        accessorKey: "fromtime",
        header: "Admit Date",
      },
      {
        id: "admitreasoncode",
        accessorKey: "admitreasoncode",
        header: "Admit reason",
      },
      {
        id: "totime",
        accessorKey: "totime",
        header: "Discharge Date",
      },
      {
        id: "dischargereasoncode",
        accessorKey: "dischargereasoncode",
        header: "Discharge reason",
      },
      {
        id: "info",
        accessorKey: "info",
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
      loading,
      treatments,
      columns,
      ui,
    };
  },
});
</script>
