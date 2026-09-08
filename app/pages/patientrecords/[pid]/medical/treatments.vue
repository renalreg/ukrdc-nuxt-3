<template>
  <div>
    <!-- External location select -->
    <div class="mb-4 flex">
      <USelectMenu
        v-model="selectedLocationOption"
        class="flex-1"
        size="lg"
        :items="locationOptions"
        placeholder="Select location type"
      />
      <UButton class="ml-2" size="lg" label="Clear" @click="selectedLocationOption = undefined" />
    </div>
    <UCard :ui="{ body: { padding: '' } }" class="mb-4">
      <UTable :loading="loading" :data="filteredTreatments" :columns="columns" class="sensitive" :ui="ui">
        <!-- Facility / QBL05 -->
        <template #healthcarefacilitycode-cell="{ row }">
          <span>
            <SendingFacilityLink class="inline font-medium" :code="row.original.healthcarefacilitycode" />
            <span v-if="row.original.qbl05" class="inline">/ {{ row.original.qbl05 }}</span>
          </span>
          <UBadge v-if="row.original.isexternallocation" color="info" class="mt-1 block w-fit"> External </UBadge>
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
import useQuery from "~/composables/query/useQuery";
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
    const { stringQuery } = useQuery();

    // Data refs
    const treatments = ref<TreatmentSchema[]>();

    // Client side external location filter
    const locationOptions = [
      { label: "External", value: "external" },
      { label: "Not external", value: "not-external" },
    ];

    const selectedLocation = stringQuery("location", undefined, true, false);

    // selectedLocationOption is the full object bound to USelectMenu (Nuxt UI v3 requires the full item)
    const selectedLocationOption = computed({
      get: () => locationOptions.find((option) => option.value === selectedLocation.value) ?? undefined,
      set: (option: { label: string; value: string } | undefined) => {
        selectedLocation.value = option?.value;
      },
    });

    // Undefined shows all treatments, otherwise filters by isexternallocation
    const filteredTreatments = computed(() => {
      if (selectedLocation.value === undefined) return treatments.value;
      const isExternalFilter = selectedLocation.value === "external";
      return treatments.value?.filter(
        (treatment: TreatmentSchema) => treatment.isexternallocation === isExternalFilter,
      );
    });

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
      td: "align-top",
    };

    return {
      formatDate,
      loading,
      filteredTreatments,
      selectedLocationOption,
      locationOptions,
      columns,
      ui,
    };
  },
});
</script>
