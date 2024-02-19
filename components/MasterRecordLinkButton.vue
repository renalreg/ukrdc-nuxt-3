<template>
  <div>
    <UChip :show="issueCount > 0" :text="issueCount" color="red" size="2xl">
      <UTooltip :prevent="issueCount <= 0" text="Errors exist on this master record">
        <UButton size="lg" :to="`/masterrecords/${masterId}`"> View Master Record </UButton>
      </UTooltip>
    </UChip>
  </div>
</template>

<script lang="ts">
import type { MasterRecordStatisticsSchema } from "@ukkidney/ukrdc-axios-ts";

import useApi from "~/composables/useApi";

export default defineComponent({
  props: {
    masterId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { masterRecordsApi } = useApi();

    // Data refs
    const stats = ref<MasterRecordStatisticsSchema>();

    // Data fetching

    function getRecord() {
      // Get basic record statistics
      masterRecordsApi
        .getMasterRecordStatistics({
          recordId: props.masterId,
        })
        .then((response) => {
          stats.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    const issueCount = computed(() => {
      let runningIssueCount = 0;
      // Add errors
      if (stats.value?.errors) {
        runningIssueCount += stats.value.errors;
      }
      // Add workitems
      if (stats.value?.workitems) {
        runningIssueCount += stats.value.workitems;
      }
      // Add UKRDC IDs (if more than 1)
      if (stats.value?.ukrdcids && stats.value.ukrdcids > 1) {
        runningIssueCount += stats.value.ukrdcids - 1;
      }
      return runningIssueCount;
    });

    onMounted(() => {
      getRecord();
    });

    return {
      stats,
      issueCount,
    };
  },
});
</script>
