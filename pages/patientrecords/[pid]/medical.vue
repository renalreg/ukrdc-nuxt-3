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
    <div class="flex gap-8">
      <UVerticalNavigation :links="tabs" />
      <NuxtPage v-if="record" class="flex-1" :record="record" />
    </div>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import { isInformational, isMembership } from "~/helpers/recordUtils";

export default defineComponent({
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
      [
        {
          label: "Results",
          to: `/patientrecords/${route.params.pid}/medical/results`,
        },
        {
          label: "Observations",
          to: `/patientrecords/${route.params.pid}/medical/observations`,
        },
      ],
      [
        {
          label: "Diagnoses",
          to: `/patientrecords/${route.params.pid}/medical/diagnoses`,
        },
      ],
      [
        {
          label: "Medications",
          to: `/patientrecords/${route.params.pid}/medical/medications`,
        },
        {
          label: "Treatments",
          to: `/patientrecords/${route.params.pid}/medical/treatments`,
        },
        {
          label: "Procedures",
          to: `/patientrecords/${route.params.pid}/medical/procedures`,
        },
        {
          label: "Dialysis",
          to: `/patientrecords/${route.params.pid}/medical/dialysis`,
        },
      ],
      [
        {
          label: "Documents",
          to: `/patientrecords/${route.params.pid}/medical/documents`,
        },
        {
          label: "Surveys",
          to: `/patientrecords/${route.params.pid}/medical/surveys`,
        },
      ],
    ];

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
