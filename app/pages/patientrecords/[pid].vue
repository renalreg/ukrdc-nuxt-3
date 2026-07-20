<template>
  <div>
    <div v-if="record && record.patient" class="mb-8 items-center sm:mb-2 sm:flex">
      <div class="mb-4 flex-grow text-center sm:text-left md:mb-0">
        <h1>
          <span class="sensitive capitalize">{{ forename.toLowerCase() }}</span>
          <span class="sensitive capitalize italic">
            {{ surname.toLowerCase() }}
          </span>
        </h1>
        <PatientRecordExtractSummary class="justify-center sm:justify-start" :record="record" />
      </div>
      <div class="flex justify-center sm:justify-start">
        <MasterRecordLinkButton v-if="record.masterId" :master-id="record.masterId" />
      </div>
    </div>

    <div class="mb-6 items-center sm:flex sm:justify-between">
      <UNavigationMenu orientation="horizontal" :items="links" />

      <QuarterlyExtractModal :pid="currentPid" :record="record" />
    </div>

    <NuxtPage v-if="record" :record="record" />
  </div>
</template>

<script lang="ts">
import type { PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import MasterRecordLinkButton from "~/components/MasterRecordLinkButton.vue";
import PatientRecordExtractSummary from "~/components/patientrecord/PatientRecordExtractSummary.vue";
import QuarterlyExtractModal from "~/components/patientrecord/QuarterlyExtractModal.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { insertIf } from "~/helpers/arrayUtils";
import { getFirstOrValue } from "~/helpers/queryUtils";
import { firstForename, firstSurname } from "~/helpers/recordUtils";

export default defineComponent({
  components: {
    PatientRecordExtractSummary,
    MasterRecordLinkButton,
    QuarterlyExtractModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { patientRecordsApi } = useApi();
    const { hasPermission } = usePermissions();

    // Head
    useHead({
      title: `Record ${route.params.pid}`,
    });

    // Data refs

    const record = ref<PatientRecordSchema>();

    // route.params.pid can technically be undefined/string[]; normalize to a
    // single guaranteed string here so downstream call sites (API calls,
    // router.push, filenames) don't hit "string | undefined" type errors.
    const currentPid = computed(() => getFirstOrValue(route.params.pid) ?? "");

    // Data fetching

    function getRecord() {
      // Fetch patient record
      patientRecordsApi
        .getPatient(
          {
            pid: currentPid.value,
          },
          { skipErrorToast: true },
        )
        .then((response) => {
          record.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    onMounted(() => {
      getRecord();
    });

    // PID Switcher UI

    const selectedPid = ref(route.params.pid);

    watch(selectedPid, (value: string | string[]) => {
      router.push({ name: route.name!, params: { pid: getFirstOrValue(value) } });
    });

    // Dynamic UI elements

    const forename = computed(() => {
      return record.value ? firstForename(record.value) : "";
    });

    const surname = computed(() => {
      return record.value ? firstSurname(record.value) : "";
    });

    // Navigation

    const links = [
      {
        label: "Overview",
        to: `/patientrecords/${route.params.pid}/overview`,
        icon: "i-heroicons-home",
      },
      {
        label: "Medical Record",
        to: `/patientrecords/${route.params.pid}/medical`,
        icon: "i-heroicons-clipboard-document-list",
      },
      {
        label: "Data Files",
        to: `/patientrecords/${route.params.pid}/messages`,
        icon: "i-heroicons-inbox",
      },
      ...insertIf(hasPermission("ukrdc:audit:records:read"), {
        label: "Audit",
        to: `/patientrecords/${route.params.pid}/audit`,
        icon: "i-heroicons-document-magnifying-glass",
      }),
    ];

    return {
      record,
      currentPid,
      selectedPid,
      forename,
      surname,
      links,
    };
  },
  head: {
    title: "Patient Record",
  },
});
</script>
