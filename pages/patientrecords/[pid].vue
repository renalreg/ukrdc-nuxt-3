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
        <div v-if="record.masterId">
          <UButton size="lg" :to="`/masterrecords/${record.masterId}`"> View Master Record </UButton>
        </div>
      </div>
    </div>

    <div class="mb-6"><BaseTabsNavigation :tabs="tabs" /></div>

    <NuxtPage v-if="record" :record="record" />
  </div>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseTabsNavigation from "~/components/base/BaseTabsNavigation.vue";
import PatientRecordExtractSummary from "~/components/patientrecord/PatientRecordExtractSummary.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { insertIf } from "~/helpers/arrayUtils";
import { firstForename, firstSurname } from "~/helpers/recordUtils";
import { type TabItem } from "~/interfaces/tabs";

export default defineComponent({
  components: {
    PatientRecordExtractSummary,
    BaseTabsNavigation,
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

    // Data fetching

    function getRecord() {
      // Fetch patient record
      patientRecordsApi
        .getPatient({
          pid: route.params.pid,
        })
        .then((response) => {
          record.value = response.data;
        });
    }

    onMounted(() => {
      getRecord();
    });

    // PID Switcher UI

    const selectedPid = ref(route.params.pid);

    watch(selectedPid, (value: string) => {
      router.push({ name: route.name!, params: { pid: value } });
    });

    // Dynamic UI elements

    const forename = computed(() => {
      return record.value ? firstForename(record.value) : "";
    });

    const surname = computed(() => {
      return record.value ? firstSurname(record.value) : "";
    });

    // Navigation

    const tabs = [
      {
        name: "Overview",
        href: `/patientrecords/${route.params.pid}`,
      },
      {
        name: "Medical Record",
        href: `/patientrecords/${route.params.pid}/medical`,
        hasChildren: true,
      },
      {
        name: "Data Files",
        href: `/patientrecords/${route.params.pid}/messages`,
      },
      ...insertIf(hasPermission("ukrdc:audit:records:read"), {
        name: "Audit",
        href: `/patientrecords/${route.params.pid}/audit`,
      }),
    ] as TabItem[];

    return {
      record,
      selectedPid,
      forename,
      surname,
      tabs,
    };
  },
  head: {
    title: "Patient Record",
  },
});
</script>
