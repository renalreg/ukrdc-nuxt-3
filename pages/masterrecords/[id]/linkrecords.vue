<template>
  <div>
    <BaseLoadingIndicator v-if="!linkRecords"></BaseLoadingIndicator>
    <div v-else class="grid grid-cols-1 gap-6">
      <LinkRecord v-for="link in linkRecords" :key="link.id" :record="link" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  type LinkRecordSchema,
  type MasterRecordSchema,
  type MasterRecordStatisticsSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingIndicator from "~/components/base/BaseLoadingIndicator.vue";
import LinkRecord from "~/components/LinkRecord.vue";
import useApi from "~/composables/useApi";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseLoadingIndicator,
    LinkRecord,
  },
  props: {
    record: {
      type: Object as () => MasterRecordSchema,
      required: true,
    },
    stats: {
      type: Object as () => MasterRecordStatisticsSchema,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const { masterRecordsApi } = useApi();

    // Data refs

    const linkRecords = ref<LinkRecordSchema[]>();

    // Data fetching
    onMounted(() => {
      masterRecordsApi
        .getMasterRecordLinkrecords({
          recordId: props.record.id,
        })
        .then((response) => {
          linkRecords.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    return {
      linkRecords,
      formatGender,
      formatDate,
    };
  },
});
</script>

<style></style>
