<template>
  <div>
    <!-- Multiple UKRDC IDs -->
    <UCard v-if="ukrdcIdGroup" :ui="{ body: { padding: '' } }" class="mb-4">
      <EMPIMultipleIDItem :group="ukrdcIdGroup" heading="Multiple UKRDC IDs" />
    </UCard>

    <!-- Related Work Items card -->
    <UCard :ui="{ body: { padding: '' } }" class="mt-4">
      <template #header>
        <div class="flex items-center">
          <h2 class="flex-grow">Work Items</h2>
          <USelectMenu
            v-model="workItemStatuses"
            :options="workItemStatusTabs"
            multiple
            placeholder="Select status"
            option-attribute="name"
            value-attribute="value"
            class="w-48"
          >
            <template #label>
              <span v-if="workItemStatuses?.length" class="truncate">
                {{ workItemStatuses?.length }} {{ workItemStatuses?.length > 1 ? "statuses" : "status" }} selected
              </span>
              <span v-else>Select status</span>
            </template>
          </USelectMenu>
        </div>
      </template>
      <!-- Skeleton results -->
      <ul v-if="workItemsFetchInProgress" class="divide-y divide-gray-300">
        <BaseSkeleListItem v-for="n in 5" :key="n" />
      </ul>
      <!-- Real results -->
      <ul v-else-if="workItems && workItems.length > 0" class="divide-y divide-gray-300">
        <li v-for="item in workItems" :key="item.id" :item="item" class="hover:bg-gray-50">
          <NuxtLink :to="`/workitems/${item.id}`">
            <WorkItemsListItem :item="item" />
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="p-4 text-center">
        <p>No work items on record</p>
      </div>
    </UCard>

    <!-- Related errors card -->
    <!-- Skeleton results -->
    <UCard v-if="!relatedErrors" :ui="{ body: { padding: '' } }" class="mt-4">
      <ul class="divide-y divide-gray-300">
        <BaseSkeleListItem v-for="n in 5" :key="n" />
      </ul>
    </UCard>
    <!-- Real results -->
    <UCard v-if="relatedErrors && relatedErrors.length > 0" :ui="{ body: { padding: '' } }" class="mt-4">
      <template #header>
        <h2>Record Errors</h2>
      </template>
      <ul class="divide-y divide-gray-300">
        <li v-for="item in relatedErrors" :key="item.id" :item="item" class="hover:bg-gray-50">
          <NuxtLink :to="`/messages/${item.id}`">
            <MessagesListItem :item="item" :show-patient-filter="false" />
          </NuxtLink>
        </li>
      </ul>

      <template #footer>
        <BasePaginator
          :jump-to-top="false"
          :page="relatedErrorsPage"
          :size="relatedErrorsSize"
          :total="relatedErrorsTotal"
          @next="relatedErrorsPage++"
          @prev="relatedErrorsPage--"
          @jump="relatedErrorsPage = $event"
        />
      </template>
    </UCard>
  </div>
</template>

<script lang="ts">
import {
  type MasterRecordSchema,
  type MasterRecordStatisticsSchema,
  type MessageSchema,
  type MultipleUKRDCIDGroup,
  type WorkItemSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BasePaginator from "~/components/base/BasePaginator.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import EMPIMultipleIDItem from "~/components/EMPIMultipleIDItem.vue";
import MessagesListItem from "~/components/messages/MessagesListItem.vue";
import WorkItemsListItem from "~/components/workitem/WorkItemsListItem.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate, nowString } from "~/helpers/dateUtils";
import { workItemStatusTabs } from "~/helpers/workItemUtils";

export default defineComponent({
  components: {
    BasePaginator,
    BaseSkeleListItem,
    MessagesListItem,
    EMPIMultipleIDItem,
    WorkItemsListItem,
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
    const { hasPermission } = usePermissions();

    // Data refs
    const workItems = ref<WorkItemSchema[]>();

    const relatedErrors = ref<MessageSchema[]>();
    const relatedErrorsPage = ref(1);
    const relatedErrorsSize = ref(5);
    const relatedErrorsTotal = ref(0);

    const ukrdcIdGroup = ref<MultipleUKRDCIDGroup>();
    const hasMultipleUKRDCIDs = ref(false);

    // Work item status tab
    const workItemStatuses = ref<string[]>(["1"]);

    // Data fetching

    const workItemsFetchInProgress = ref(false);

    function fetchWorkItems() {
      // Use the record links to load related data concurrently
      if (hasPermission("ukrdc:workitems:read")) {
        workItemsFetchInProgress.value = true;

        masterRecordsApi
          .getMasterRecordWorkitems({
            recordId: props.record.id,
            status: workItemStatuses.value.filter((el) => !isNaN(Number(el))).map(Number),
          })
          .then((response) => {
            workItems.value = response.data;
          })
          .finally(() => {
            workItemsFetchInProgress.value = false;
          });
      }
    }

    function updateRelatedErrors() {
      masterRecordsApi
        .getMasterRecordMessages({
          recordId: props.record.id,
          page: relatedErrorsPage.value ?? 1,
          size: relatedErrorsSize.value,
          orderBy: "desc",
          status: ["ERROR"],
        })
        .then((response) => {
          relatedErrors.value = response.data.items;
          relatedErrorsPage.value = response.data.page ?? 0;
          relatedErrorsSize.value = response.data.size ?? 0;
          relatedErrorsTotal.value = response.data.total ?? 0;
        });
    }

    function fetchMultipleUKRDCIds() {
      // If we haven't already fetched the multiple records, and multiple records exist
      if (!hasMultipleUKRDCIDs.value && props.stats?.ukrdcids > 1) {
        // Stop the request from triggering again
        hasMultipleUKRDCIDs.value = true;

        masterRecordsApi
          .getMasterRecordRelated({
            recordId: props.record.id,
            excludeSelf: false,
            nationalidType: "UKRDC",
          })
          .then((response) => {
            // Create a "synthetic" MultipleUKRDCIDsGroup
            // We do this so that we can re-use the component used in the EMPI Data Health page
            const multipleIdsGroup = {
              groupId: 0,
              records: [],
            } as MultipleUKRDCIDGroup;

            for (const record of response.data) {
              multipleIdsGroup.records.push({
                lastUpdated: nowString() ?? "Unknown",
                masterRecord: record,
              });
            }
            ukrdcIdGroup.value = multipleIdsGroup;
          });
      }
    }

    onMounted(() => {
      fetchMultipleUKRDCIds();
      fetchWorkItems();
      updateRelatedErrors();
    });

    watch(workItemStatuses, () => {
      fetchWorkItems();
    });

    watch(relatedErrorsPage, () => {
      updateRelatedErrors();
    });

    watch(
      () => props.stats,
      () => {
        fetchMultipleUKRDCIds();
      },
    );

    return {
      workItems,
      workItemsFetchInProgress,
      relatedErrors,
      relatedErrorsPage,
      relatedErrorsSize,
      relatedErrorsTotal,
      ukrdcIdGroup,
      workItemStatusTabs,
      workItemStatuses,
      formatGender,
      formatDate,
    };
  },
});
</script>

<style></style>
