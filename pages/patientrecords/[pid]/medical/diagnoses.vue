<template>
  <BaseLoadingContainer :loading="!(diagnoses && renalDiagnoses && causesOfDeath)">
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-3 lg:col-span-2">
        <UCard :ui="{ body: { padding: '' } }">
          <template #header>
            <h2>Diagnoses</h2>
          </template>
          <div class="p-4">
            <div v-if="diagnoses && diagnoses.length <= 0">
              <p class="text-center">No diagnoses on record</p>
            </div>
            <div v-else class="sensitive divide-y divide-gray-300">
              <PatientRecordDiagnosisListItem v-for="diagnosis in diagnoses" :key="diagnosis.id" :item="diagnosis" />
            </div>
          </div>
        </UCard>
      </div>
      <div class="col-span-3 flex flex-col gap-4 lg:col-span-1">
        <UCard>
          <template #header>
            <h2>Renal Diagnoses</h2>
          </template>
          <div v-if="renalDiagnoses && renalDiagnoses.length <= 0">
            <p class="text-center">No renal diagnoses on record</p>
          </div>
          <div v-else class="sensitive divide-y divide-gray-300">
            <PatientRecordDiagnosisListItem
              v-for="renalDiagnosis in renalDiagnoses"
              :key="renalDiagnosis.pid"
              :item="renalDiagnosis"
              :small="true"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2>Cause of Death</h2>
          </template>
          <div v-if="causesOfDeath && causesOfDeath.length <= 0">
            <p class="text-center">No cause of death on record</p>
          </div>
          <div v-else class="sensitive divide-y divide-gray-300">
            <PatientRecordCauseOfDeathListItem
              v-for="causeOfDeath in causesOfDeath"
              :key="causeOfDeath.pid"
              :item="causeOfDeath"
              :small="true"
            />
          </div>
        </UCard>
      </div>
    </div>
  </BaseLoadingContainer>
</template>

<script lang="ts">
import {
  type ExtendedCauseOfDeathSchema,
  type ExtendedDiagnosisSchema,
  type ExtendedRenalDiagnosisSchema,
  type PatientRecordSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import PatientRecordCauseOfDeathListItem from "~/components/patientrecord/medical/PatientRecordCauseOfDeathListItem.vue";
import PatientRecordDiagnosisListItem from "~/components/patientrecord/medical/PatientRecordDiagnosisListItem.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseLoadingContainer,
    PatientRecordCauseOfDeathListItem,
    PatientRecordDiagnosisListItem,
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
    const diagnoses = ref<ExtendedDiagnosisSchema[]>();
    const renalDiagnoses = ref<ExtendedRenalDiagnosisSchema[]>();
    const causesOfDeath = ref<ExtendedCauseOfDeathSchema[]>();

    // Data fetching
    onMounted(() => {
      patientRecordsApi
        .getPatientDiagnosis({
          pid: props.record.pid,
        })
        .then((response) => {
          diagnoses.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      patientRecordsApi
        .getPatientRenalDiagnosis({
          pid: props.record.pid,
        })
        .then((response) => {
          renalDiagnoses.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      patientRecordsApi
        .getPatientCauseOfDeath({
          pid: props.record.pid,
        })
        .then((response) => {
          causesOfDeath.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    return {
      formatDate,
      diagnoses,
      renalDiagnoses,
      causesOfDeath,
    };
  },
});
</script>
