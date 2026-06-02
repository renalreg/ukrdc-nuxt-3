<template>
  <div>
    <!-- Issues alert -->
    <div v-if="record && stats && stats.ukrdcids > 1">
      <NuxtLink :to="`/masterrecords/${record.id}/issues`">
        <UAlert
          color="red"
          icon="i-heroicons-exclamation-triangle-20-solid"
          class="mb-4"
          :title="`${stats.ukrdcids} UKRDC IDs found for this patient. Click for details.`"
        />
      </NuxtLink>
    </div>

    <div v-if="record && issueMessage">
      <NuxtLink :to="`/masterrecords/${record.id}/issues`">
        <UAlert color="orange" icon="i-heroicons-exclamation-triangle-20-solid" class="mb-4" :title="issueMessage" />
      </NuxtLink>
    </div>

    <div v-if="record" class="mb-2">
      <span>
        <h1 class="sensitive inline capitalize">{{ record.givenname?.toLowerCase() }}</h1>
        <h1 class="sensitive inline capitalize italic">{{ record.surname?.toLowerCase() }}</h1>
      </span>
      <h5>{{ record.nationalidType }} record</h5>
    </div>

    <div class="mb-6">
      <UHorizontalNavigation :links="links" />
    </div>

    <NuxtPage v-if="record" :record="record" :stats="stats" />
  </div>
</template>

<script lang="ts">
import { type MasterRecordSchema, type MasterRecordStatisticsSchema } from "@ukkidney/ukrdc-axios-ts";

import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { insertIf } from "~/helpers/arrayUtils";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  setup() {
    const route = useRoute();
    const { masterRecordsApi } = useApi();
    const { hasPermission } = usePermissions();

    // Head
    useHead({
      title: `Record ${route.params.id}`,
    });

    // Navigation

    const links = [
      {
        label: "Overview",
        to: `/masterrecords/${route.params.id}/overview`,
      },
      ...insertIf(hasPermission("ukrdc:messages:read"), {
        label: "Data Files",
        to: `/masterrecords/${route.params.id}/messages`,
      }),
      {
        label: "Link Records",
        to: `/masterrecords/${route.params.id}/linkrecords`,
      },
      {
        label: "Issues",
        to: `/masterrecords/${route.params.id}/issues`,
      },
    ];

    // Data refs

    const record = ref<MasterRecordSchema>();
    const stats = ref<MasterRecordStatisticsSchema>();

    // Data fetching

    function fetchRecord() {
      masterRecordsApi
        .getMasterRecord({
          recordId: Number(route.params.id),
        })
        .then((response) => {
          record.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      // Get basic record statistics
      masterRecordsApi
        .getMasterRecordStatistics({
          recordId: Number(route.params.id),
        })
        .then((response) => {
          stats.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      // Generate issues warning message
      issueMessage.value = buildErrorMessage(stats.value);
    }

    onMounted(() => {
      fetchRecord();
    });

    // Dynamic UI elements

    const issueMessage = ref<string>();

    function buildErrorMessage(stats?: MasterRecordStatisticsSchema): string {
      let msg = "";
      let workItemsMsg = "";
      let errorMsg = "";
      if (stats) {
        if (stats?.workitems > 0) {
          workItemsMsg += `${stats?.workitems} workitem`;
        }
        if (stats?.workitems > 1) {
          workItemsMsg += "s";
        }
        if (stats?.errors > 0) {
          errorMsg += `${stats?.errors} error`;
        }
        if (stats?.errors > 1) {
          errorMsg += "s";
        }
      }
      if (workItemsMsg) {
        msg += workItemsMsg;
      }
      if (workItemsMsg && errorMsg) {
        msg += " and ";
      }
      if (errorMsg) {
        msg += errorMsg;
      }
      if (workItemsMsg || errorMsg) {
        msg += " found on record. Click for details.";
      }
      return msg;
    }

    return {
      links,
      record,
      stats,
      issueMessage,
      formatGender,
      formatDate,
    };
  },
  head: {
    title: "Master Record",
  },
});
</script>

<style></style>
