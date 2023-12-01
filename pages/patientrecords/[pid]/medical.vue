<template>
  <div>
    <NuxtLink :to="`/patientrecords/${record.pid}/`">
      <UAlert
        v-if="!recordProbablyContainsData"
        color="orange"
        icon="i-heroicons-exclamation-triangle-20-solid"
        class="mb-4"
        :title="`You are currently viewing ${recordDescription}, which may not contain medical data.`"
        description="Click to check Related Records for available data feed records."
      />
    </NuxtLink>
    <BaseTabsNavigation id="medical-tabs" class="mb-6" :tabs="tabs" :mini="true" :eager-to-collapse="true" />
    <NuxtPage v-if="record" :record="record" />
  </div>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseTabsNavigation from "~/components/base/BaseTabsNavigation.vue";
import { isInformational, isMembership } from "~/helpers/recordUtils";
import { type TabItem } from "~/interfaces/tabs";

export default defineComponent({
  components: {
    BaseTabsNavigation,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    const router = useRouter();

    // Record type checks

    const recordProbablyContainsData = computed<boolean>(() => {
      return !(isInformational(props.record) || isMembership(props.record));
    });

    const recordDescription = computed<string>(() => {
      if (isInformational(props.record)) {
        return `an informational ${props.record.sendingfacility} record`;
      } else if (isMembership(props.record)) {
        const membershipType = props.record.sendingextract === "RADAR" ? "RADAR" : props.record.sendingfacility;
        return `a ${membershipType} membership record`;
      } else {
        return `a ${props.record.sendingextract} record sent by ${props.record.sendingfacility}`;
      }
    });

    // Navigation

    const tabs = [
      {
        name: "Results",
        href: `/patientrecords/${route.params.pid}/medical/results`,
      },
      {
        name: "Observations",
        href: `/patientrecords/${route.params.pid}/medical/observations`,
      },
      {
        name: "Diagnoses",
        href: `/patientrecords/${route.params.pid}/medical/diagnoses`,
      },
      {
        name: "Medications",
        href: `/patientrecords/${route.params.pid}/medical/medications`,
      },
      {
        name: "Treatments",
        href: `/patientrecords/${route.params.pid}/medical/treatments`,
      },
      {
        name: "Dialysis",
        href: `/patientrecords/${route.params.pid}/medical/dialysis`,
      },
      {
        name: "Documents",
        href: `/patientrecords/${route.params.pid}/medical/documents`,
        hasChildren: true,
      },
      {
        name: "Surveys",
        href: `/patientrecords/${route.params.pid}/medical/surveys`,
        hasChildren: true,
      },
    ] as TabItem[];

    onMounted(() => {
      // Default to first child tab
      if (route.path === `/patientrecords/${route.params.pid}/medical`) {
        router.push(`/patientrecords/${route.params.pid}/medical/results`);
      }
    });

    return {
      recordProbablyContainsData,
      recordDescription,
      tabs,
    };
  },
});
</script>
