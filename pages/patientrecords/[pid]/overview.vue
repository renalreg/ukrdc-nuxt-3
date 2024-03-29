<template>
  <div>
    <!-- Demographics header-->
    <UCard v-if="record.patient" class="mb-4">
      <BaseDescriptionListGrid>
        <BaseDescriptionListGridItem>
          <dt>Names</dt>
          <dd>
            <p v-for="item in record.patient.names ?? []" :key="item.given + item.family" class="sensitive">
              {{ item.given }} {{ item.family }}
            </p>
          </dd>
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Gender</dt>
          <dd class="sensitive flex items-center gap-2">
            <div>{{ formatGender(record.patient.gender) }}</div>
            <PatientRecordMatchBadge v-if="genderMatches !== null" :verified="genderMatches" />
          </dd>
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Ethnicity</dt>
          <dd class="sensitive">
            {{ record.patient.ethnicGroupDescription ?? record.patient.ethnicGroupCode ?? "Unknown" }}
          </dd>
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Date of Birth</dt>
          <dd class="sensitive flex items-center gap-2">
            <div>{{ formatDate(record.patient.birthTime, false) }}</div>
            <PatientRecordMatchBadge v-if="birthTimeMatches !== null" :verified="birthTimeMatches" />
          </dd>
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Date of Death</dt>
          <dd class="sensitive flex items-center gap-2">
            <div>
              {{ record.patient.deathTime ? formatDate(record.patient.deathTime, false) : "N/A" }}
            </div>
            <PatientRecordMatchBadge v-if="deathTimeMatches !== null" :verified="deathTimeMatches" />
          </dd>
        </BaseDescriptionListGridItem>
      </BaseDescriptionListGrid>
    </UCard>

    <!-- Record message banners -->
    <NuxtLink :to="`/patientrecords/${record.pid}/messages`">
      <LatestMessageAlert
        :message="latestMessage"
        :fallback-message="`No new patient data received from ${record.sendingfacility} in the last year`"
        :is-loading="latestMessageIsLoading"
      />
    </NuxtLink>

    <!-- Main content container-->
    <div class="grid grid-cols-3 gap-4">
      <!-- Record summary -->
      <div class="col-span-3 md:col-span-1">
        <!-- Record history -->
        <div class="mb-4">
          <PatientRecordSummaryHistory :record="record" />
        </div>
        <!-- Record numbers -->
        <div class="mb-4">
          <h4 class="mb-3">Patient Numbers</h4>
          <PatientRecordSummaryNumbers class="patient-infocard-ul" :record="record" />
        </div>
        <!-- PV Data -->
        <div v-if="record.pvdata" class="col-span-3 mb-4 sm:col-span-2">
          <h4 class="mb-3">RRT Information</h4>
          <PatientRecordSummaryPVData :record="record" />
        </div>
        <!-- Addresses-->
        <div v-if="record.patient && record.patient.addresses && record.patient.addresses.length > 0" class="mb-4">
          <h4 class="mb-3">Addresses</h4>
          <PatientRecordSummaryAddresses class="patient-infocard-ul" :record="record" />
        </div>
        <!-- Programme memberships-->
        <div v-if="record.programMemberships && record.programMemberships.length > 0" class="mb-4">
          <h4 class="mb-3">Program Memberships</h4>
          <PatientRecordSummaryMemberships class="patient-infocard-ul" :record="record" />
        </div>
        <!-- Family doctor-->
        <div v-if="record.patient && record.patient.familydoctor" class="mb-4">
          <h4 class="mb-3">Family Doctor</h4>
          <PatientRecordSummaryFamilyDoctor class="patient-infocard-ul" :record="record" />
        </div>
      </div>
      <!-- Related records -->
      <UCard :ui="{ body: { padding: '' } }" class="col-span-3 h-fit !overflow-visible md:col-span-2">
        <template #header>
          <h2>Related Records</h2>
          <p class="label">All records, including data feeds and memberships, for this patient</p>
        </template>
        <PatientRecordsGroupedList v-if="related" :records="related" @refresh="refreshRecords" />
        <ul v-else class="divide-y divide-gray-300">
          <BaseSkeleListItem v-for="n in 5" :key="n" />
        </ul>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
import {
  type MinimalMessageSchema,
  type PatientRecordSchema,
  type PatientRecordSummarySchema,
} from "@ukkidney/ukrdc-axios-ts";

import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import LatestMessageAlert from "~/components/messages/AlertFileLatest.vue";
import PatientRecordMatchBadge from "~/components/patientrecord/PatientRecordMatchBadge.vue";
import PatientRecordsGroupedList from "~/components/patientrecord/PatientRecordsGroupedList.vue";
import PatientRecordSummaryAddresses from "~/components/patientrecord/summary/PatientRecordSummaryAddresses.vue";
import PatientRecordSummaryFamilyDoctor from "~/components/patientrecord/summary/PatientRecordSummaryFamilyDoctor.vue";
import PatientRecordSummaryHistory from "~/components/patientrecord/summary/PatientRecordSummaryHistory.vue";
import PatientRecordSummaryMemberships from "~/components/patientrecord/summary/PatientRecordSummaryMemberships.vue";
import PatientRecordSummaryNumbers from "~/components/patientrecord/summary/PatientRecordSummaryNumbers.vue";
import PatientRecordSummaryPVData from "~/components/patientrecord/summary/PatientRecordSummaryPVData.vue";
import useApi from "~/composables/useApi";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";
import { isEmptyObject } from "~/helpers/objectUtils";

export default defineComponent({
  components: {
    PatientRecordMatchBadge,
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
    PatientRecordSummaryFamilyDoctor,
    PatientRecordSummaryMemberships,
    PatientRecordSummaryAddresses,
    PatientRecordSummaryPVData,
    PatientRecordSummaryNumbers,
    PatientRecordSummaryHistory,
    BaseSkeleListItem,
    PatientRecordsGroupedList,
    LatestMessageAlert,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const { ukrdcRecordGroupApi, patientRecordsApi } = useApi();

    // Data refs

    const related = ref<PatientRecordSummarySchema[]>();

    const latestMessage = ref<MinimalMessageSchema>();
    const latestMessageIsLoading = ref(true);

    // Data fetching

    function fetchRecordData() {
      // Get related records
      ukrdcRecordGroupApi
        .getUkrdcidRecords({
          ukrdcid: props.record.ukrdcid,
        })
        .then((response) => {
          related.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      // Get latest message data
      patientRecordsApi
        .getPatientRecordLatestMessage({
          pid: props.record.pid,
        })
        .then((response) => {
          latestMessage.value = response.data;
          latestMessageIsLoading.value = false;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    function refreshRecords() {
      // Wait 1 second before refreshing.
      // Some operations like new memberships or deleted records can take a while to propagate,
      // so we wait a second to give the server a chance to catch up.

      // Reset the related records array to display placeholders
      related.value = undefined;
      // Wait a second, then reload the data
      setTimeout(fetchRecordData, 1000);
    }

    onMounted(() => {
      fetchRecordData();
    });

    // Demographic comparisons

    const genderMatches = computed<boolean | null>(() => {
      if (related.value) {
        for (const relatedRecord of related.value) {
          // If a gender code is present on the related record,
          // and the gender code is not unspecified,
          // and does not match the current record
          if (
            relatedRecord.patient?.gender &&
            relatedRecord.patient?.gender !== "9" &&
            relatedRecord.patient?.gender !== props.record.patient?.gender
          ) {
            return false;
          }
        }
        return true;
      }
      return null;
    });

    const birthTimeMatches = computed<boolean | null>(() => {
      if (related.value) {
        for (const relatedRecord of related.value) {
          if (relatedRecord.patient?.birthTime !== props.record.patient?.birthTime) {
            return false;
          }
        }
        return true;
      }
      return null;
    });

    const deathTimeMatches = computed<boolean | null>(() => {
      if (related.value) {
        for (const relatedRecord of related.value) {
          if (relatedRecord.patient?.deathTime !== props.record.patient?.deathTime) {
            return false;
          }
        }
        return true;
      }
      return null;
    });

    return {
      related,
      latestMessage,
      latestMessageIsLoading,
      refreshRecords,
      formatDate,
      formatGender,
      isEmptyObject,
      genderMatches,
      birthTimeMatches,
      deathTimeMatches,
    };
  },
});
</script>

<style lang="postcss" scoped>
.patient-infocard-ul {
  @apply grid grid-cols-1 gap-4 xl:grid-cols-2;
}
</style>
