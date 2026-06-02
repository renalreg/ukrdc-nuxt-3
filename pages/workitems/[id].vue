<template>
  <div>
    <!-- Update modal -->
    <BaseModal v-if="hasPermission('ukrdc:workitems:write')" ref="updateWorkItemModal">
      <div class="mb-4 text-left">
        <div class="mb-4">Add Work Item comment</div>
        <UTextarea v-model="customComment" :rows="3" :color="customComment.length > 100 ? 'red' : 'primary'" />
      </div>

      <!-- Allow setting as WIP if not already closed -->
      <UCheckbox v-if="record && record.status !== 3" v-model="isWIP" label="Mark as work-in-progress (WIP)" />

      <div class="flex justify-end">
        <UButton @click="updateWorkItemModal?.hide()">Cancel</UButton>
        <UButton color="indigo" class="ml-2" type="submit" @click="updateWorkItem()"> Save </UButton>
      </div>
    </BaseModal>

    <!-- Close modal -->
    <BaseModal v-if="hasPermission('ukrdc:workitems:write')" ref="closeModal">
      <div class="mb-4 text-left">
        <div class="mb-4">
          {{ closeMessageOverride ? closeMessageOverride : "Close the Work Item" }}
        </div>

        <label for="closeModalComments"> Comments </label>
        <UTextarea
          id="closeModalComments"
          v-model="customComment"
          :rows="3"
          :color="customComment.length > 100 ? 'red' : 'primary'"
        />
      </div>

      <div class="flex justify-end">
        <UButton @click="closeModal?.hide()"> Cancel </UButton>
        <UButton :disabled="!customComment" type="submit" class="ml-3" color="red" @click="handleCloseWorkItem()">
          Close Work Item
        </UButton>
      </div>
    </BaseModal>

    <!-- Header -->
    <div class="mb-6">
      <h1 v-if="record">Work Item {{ record.id }} {{ statusString }}</h1>
      <USkeleton v-else class="mb-2 h-8 w-1/4" />
      <h5 v-if="record">
        {{ record.description }}
      </h5>
      <USkeleton v-else class="h-4 w-1/2" />
    </div>

    <!-- Info Cards -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Work Item Details -->
      <WorkItemDetailCard :item="record" />
      <!-- Work Item Advice -->
      <WorkItemAdviceCard :item="record" :related="workItemCollection" />
    </div>

    <!-- Action Buttons -->
    <div
      v-if="hasPermission('ukrdc:workitems:write') && record"
      class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <UButton
        v-if="availableActions.comment"
        color="indigo"
        label="Update"
        icon="i-heroicons-pencil-20-solid"
        @click="updateWorkItemModal?.show()"
      />

      <UButton
        v-if="availableActions.close && record.status !== 3"
        color="green"
        label="Close"
        icon="i-heroicons-check-circle-20-solid"
        @click="closeModal?.show()"
      />

      <UTooltip v-if="availableActions.merge && record.status !== 3" text="You will be redirected here after merging">
        <UButton
          :to="{
            path: '/empi/merge',
            query: {
              superseded: record.incoming.masterRecords[relatedRecordsIndex].id,
              superseding: record.destination.masterRecord?.id,
              callback: $route.fullPath + '?justMerged=true',
            },
          }"
          color="yellow"
          label="Merge Master Records"
          icon="i-heroicons-arrow-top-right-on-square-20-solid"
          class="w-full"
        />
      </UTooltip>
    </div>

    <!-- Work Item Trigger -->
    <div v-if="record" class="mb-8">
      <div class="mb-8">
        <p>
          This work item was raised because demographic attributes on
          <span class="personrecord-label">{{
            record.type === 9 ? "one of the incoming data files" : "the Person Record"
          }}</span>
          below did not match the
          <span class="masterrecord-label">Master Record</span> it is linked to.
        </p>
        <p v-if="record.type !== 9 && messages && messages.length > 0">
          This may be because a <b>Related Data File</b> below updated the
          <span class="masterrecord-label">Master Record</span>, and this update means that it no longer matches the
          <span class="personrecord-label">Person Record</span> below.
        </p>
      </div>

      <div v-if="record.attributes" class="mb-8">
        <p class="mb-4 font-medium">
          Values of mismatching attributes
          <em>at the time this work item was first raised.</em>
        </p>
        <UCard :ui="{ body: { padding: '' } }" class="mb-4">
          <UTable :rows="attributesRows" :columns="attributesCols" class="sensitive"> </UTable>
        </UCard>
      </div>

      <div class="mb-4">
        <p class="font-medium">Summary of currently stored record demographics.</p>
        <p>If these now match, this work item can likely be closed with no further action.</p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div id="incomingCard">
          <!-- Else incoming person card -->
          <PersonRecordCard
            v-if="record.incoming.person"
            :record="record.incoming.person"
            :label="`Person Record ${record.incoming.person.id}`"
            :highlight="highlightedAttributes"
            :full="showDestinationPersons"
          />
          <!-- Missing incoming person card -->
          <div v-else class="rounded-md bg-yellow-50 p-4 font-medium text-yellow-800">
            <span v-if="record.type === 9">
              Incoming file was rejected, so no Person record exists for this work item yet.
              <br />
              See Related Data Files below to identify the rejected file.
            </span>
            <span v-else> Person record associated with this work item is missing, and may have been deleted. </span>
          </div>
        </div>

        <div id="destinationCard">
          <!-- Destination record card -->
          <NuxtLink v-if="record.destination.masterRecord" :to="`/masterrecords/${record.destination.masterRecord.id}`">
            <MasterRecordCard
              :record="record.destination.masterRecord"
              :label="`Destination Master Record ${record.destination.masterRecord.id}`"
            />
          </NuxtLink>
          <!-- Missing destination record card -->
          <div v-else class="rounded-md bg-red-50 p-4 text-red-800">
            <p class="font-medium">Destination record no longer exists</p>
            <p>The record may have been merged or delete already</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Proposed Merge -->
    <div v-if="availableActions.merge">
      <h2 class="mb-4">Proposed Merge</h2>

      <div v-if="record" class="mb-8">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Incoming records card -->
          <NuxtLink
            v-if="record.incoming.masterRecords.length > 0"
            :to="`/masterrecords/${record.incoming.masterRecords[relatedRecordsIndex].id}`"
          >
            <MasterRecordCard
              :record="record.incoming.masterRecords[relatedRecordsIndex]"
              :label="`Incoming Master Record ${relatedRecordsIndex + 1} of ${record.incoming.masterRecords.length}`"
            />
          </NuxtLink>
          <!-- Empty incoming records card -->
          <div v-else class="rounded-md bg-red-50 p-4 font-medium text-red-800">No new incoming Master Records</div>
          <NuxtLink v-if="record.destination.masterRecord" :to="`/masterrecords/${record.destination.masterRecord.id}`">
            <MasterRecordCard :record="record.destination.masterRecord" label="Destination Master Record" />
          </NuxtLink>
        </div>
        <UCard v-if="record.incoming.masterRecords.length > 1" :ui="{ body: { padding: '' } }" class="mt-2 pl-4">
          <BaseItemPaginator
            v-model="relatedRecordsIndex"
            :total="record.incoming.masterRecords.length"
            item-label="Record"
        /></UCard>
      </div>
    </div>

    <!-- Related messages card -->
    <UCard v-if="messages && messages.length > 0" :ui="{ body: { padding: '' } }" class="mb-8">
      <template #header>
        <h2>Related Data Files</h2>
        <h6>
          Data files received around the time the work item was first raised. One of these may be responsible for the
          work item.
        </h6>
      </template>
      <ul class="divide-y divide-gray-300">
        <li v-for="item in messages" :key="item.id" class="hover:bg-gray-50">
          <NuxtLink :to="`/messages/${item.id}`">
            <MessagesListItem :item="item" />
          </NuxtLink>
        </li>
      </ul>

      <template #footer>
        <BasePaginator
          :jump-to-top="false"
          :page="messagesPage"
          :size="messagesSize"
          :total="messagesTotal"
          @next="messagesPage++"
          @prev="messagesPage--"
          @jump="messagesPage = $event"
        />
      </template>
    </UCard>

    <!-- Related Work Items  -->
    <UCard v-if="workItemCollection.length > 0" :ui="{ body: { padding: '' } }" class="mb-8">
      <!-- Card header -->
      <template #header>
        <h2>Related Work Items</h2>
        <h6>Work Items for the same patient, raised by the same event</h6>
      </template>
      <!-- Results list -->
      <ul class="divide-y divide-gray-300">
        <li v-for="item in workItemCollection" :key="item.id" class="hover:bg-gray-50">
          <NuxtLink :to="`/workitems/${item.id}`">
            <WorkItemsListItem :item="item" />
          </NuxtLink>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts">
import { type MessageSchema, type WorkItemExtendedSchema, type WorkItemSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseItemPaginator from "~/components/base/BaseItemPaginator.vue";
import BaseModal from "~/components/base/BaseModal.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import MasterRecordCard from "~/components/MasterRecordCard.vue";
import MessagesListItem from "~/components/messages/MessagesListItem.vue";
import PersonRecordCard from "~/components/PersonRecordCard.vue";
import WorkItemAdviceCard from "~/components/workitem/WorkItemAdviceCard.vue";
import WorkItemDetailCard from "~/components/workitem/WorkItemDetailCard.vue";
import WorkItemsListItem from "~/components/workitem/WorkItemsListItem.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";
import { isEmptyObject } from "~/helpers/objectUtils";
import { delay } from "~/helpers/timeUtils";
import { workItemIsMergable } from "~/helpers/workItemUtils";
import { type ModalInterface } from "~/interfaces/modal";

interface AvailableActions {
  close: boolean;
  comment: boolean;
  merge: boolean;
  unlink: boolean;
}

export default defineComponent({
  components: {
    BaseItemPaginator,
    BaseModal,
    BasePaginator,
    PersonRecordCard,
    MasterRecordCard,
    WorkItemAdviceCard,
    WorkItemDetailCard,
    WorkItemsListItem,
    MessagesListItem,
  },
  setup() {
    // Dependencies
    const route = useRoute();
    const toast = useToast();
    const { hasPermission } = usePermissions();
    const { workItemsApi } = useApi();

    // Head
    useHead({
      title: `Work Item ${route.params.id}`,
    });

    // Work item record data
    const record = ref<WorkItemExtendedSchema>();
    const customComment = ref("");

    const isWIP = ref(false);

    const highlightedAttributes = computed(() => {
      const attributeKeys: string[] = [];
      if (record.value?.attributes) {
        Object.entries(record.value.attributes).forEach(([key, value]) => {
          if (value) {
            attributeKeys.push(key);
          }
        });
      }
      return attributeKeys;
    });

    // Related persons data
    const workItemCollection = ref([] as WorkItemSchema[]);

    // Related messages data
    const messages = ref<MessageSchema[]>();
    const messagesPage = ref(1);
    const messagesSize = ref(5);
    const messagesTotal = ref(0);

    // Related record paginator data
    const relatedRecordsIndex = ref(0);
    const relatedPersonsIndex = ref(0);

    // Data fetching

    function updateRelatedMessages() {
      workItemsApi
        .getWorkitemMessages({
          workitemId: Number(route.params.id),
        })
        .then((response) => {
          messages.value = response.data.items;
          messagesPage.value = response.data.page ?? 0;
          messagesSize.value = response.data.size ?? 0;
          messagesTotal.value = response.data.total ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    function getWorkItem() {
      workItemsApi
        .getWorkitem({
          workitemId: Number(route.params.id),
        })
        .then((response) => {
          record.value = response.data;
          isWIP.value = response.data.status === 2;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      workItemsApi
        .getWorkitemCollection({
          workitemId: Number(route.params.id),
        })
        .then((response) => {
          workItemCollection.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });

      updateRelatedMessages();

      // Apply existing comment
      customComment.value = record.value?.updateDescription ?? "";

      // Check if the workitem has already been merged and is ready to be closed
      checkMerged();
    }

    onMounted(() => {
      getWorkItem();
    });

    watch(messagesPage, () => {
      updateRelatedMessages();
    });

    // Trigger dynamic modals

    function checkMerged() {
      if (
        record.value?.status === 1 &&
        record.value?.destination.masterRecord?.nationalidType === "UKRDC" &&
        record.value?.incoming?.masterRecords?.length !== undefined &&
        record.value?.incoming?.masterRecords?.length <= 0 &&
        route.query.justMerged === "true"
      ) {
        closeMessageOverride.value =
          "It looks like the incoming Master Record for this Work Item has been merged. Close the Work Item?";
        closeModal.value?.show();
      }
    }

    // Dynamic UI

    const statusString = computed(() => {
      if (record.value?.status === 1) {
        return "(Open)";
      } else if (record.value?.status === 2) {
        return "(WIP)";
      } else if (record.value?.status === 3) {
        return "(Closed)";
      } else {
        return "(Unknown status)";
      }
    });

    const showIncomingAttributes = ref(false);

    const showDestinationPersons = ref(false);

    const availableActions = computed<AvailableActions>(() => {
      return {
        // We can always comment and close?
        close: true,
        comment: true,
        // We can only merge if we have an incoming Master Record, and both
        // incoming and destination records are UKRDC type
        merge: record.value ? workItemIsMergable(record.value) : false,
        // Currently Unlink never makes sense, so ignore for now. Maybe remove entirely?
        unlink: false,
      } as AvailableActions;
    });

    const closeMessageOverride = ref<String>();

    // Template refs
    const updateWorkItemModal = ref<ModalInterface>();
    const closeModal = ref<ModalInterface>();

    // Workitem actions
    function statusToSet(): number | undefined {
      if (record.value?.status === 2 && !isWIP.value) {
        return 1;
      }
      if (record.value?.status === 1 && isWIP.value) {
        return 2;
      }
      return record.value?.status;
    }

    function updateWorkItem() {
      workItemsApi
        .putWorkitemUpdate({
          workitemId: Number(route.params.id),
          updateWorkItemRequest: {
            comment: customComment.value,
            status: statusToSet(),
          },
        })
        .then(() => {
          toast.add({
            title: "Success",
            description: "Work item updated. Reloading...",
          });
        })
        .catch((error) => {
          toast.add({
            title: "Error",
            description: error.response.data.detail,
            color: "red",
          });
          throw error;
        })
        .finally(() => {
          // Delay fetch to allow JTRACE time to process
          delay(1000).then(() => {
            getWorkItem();
          });
        });

      const el = updateWorkItemModal.value as ModalInterface;
      el.toggle();
    }

    function handleCloseWorkItem() {
      workItemsApi
        .postWorkitemClose({
          workitemId: Number(route.params.id),
          closeWorkItemRequest: {
            comment: customComment.value,
          },
        })
        .then(() => {
          toast.add({
            title: "Success",
            description: "Work Item closed. Reloading...",
          });
        })
        .catch((error) => {
          toast.add({
            title: "Error",
            description: error.response.data.detail,
            color: "red",
          });
          throw error;
        })
        .finally(() => {
          // Delay fetch to allow JTRACE time to process
          delay(1000).then(() => {
            getWorkItem();
          });
        });

      const el = closeModal.value as ModalInterface;
      el.toggle();
    }

    // Table data
    interface AttributeRow {
      key: string;
      incomingValue: any;
      destinationValue: any;
    }

    const attributesRows = computed<AttributeRow[]>(() => {
      const rows: AttributeRow[] = [];
      if (record.value?.attributes) {
        for (const [key, value] of Object.entries(record.value.attributes)) {
          if (value) {
            // Format/process row data depending on key
            if (key === "dateOfBirth" || key === "dateOfDeath") {
              rows.push({
                key,
                incomingValue: formatDate(value.split(":")[0], false),
                destinationValue: formatDate(value.split(":")[1], false),
              });
            } else if (key === "gender") {
              rows.push({
                key,
                incomingValue: formatGender(value.split(":")[0]),
                destinationValue: formatGender(value.split(":")[1]),
              });
            } else {
              rows.push({
                key,
                incomingValue: value.split(":")[0],
                destinationValue: value.split(":")[1],
              });
            }
          }
        }
        return rows;
      } else {
        return [];
      }
    });

    const attributesCols = computed(() => {
      if (record.value) {
        return [
          {
            key: "key",
            label: "Mismatched attribute",
          },
          {
            key: "incomingValue",
            label: record.value.type === 9 ? "Incoming" : "Person Record",
          },
          {
            key: "destinationValue",
            label: "Master Record Value",
          },
        ];
      } else {
        return [];
      }
    });

    return {
      record,
      highlightedAttributes,
      attributesRows,
      attributesCols,
      formatDate,
      formatGender,
      isEmptyObject,
      workItemCollection,
      messages,
      messagesPage,
      messagesSize,
      messagesTotal,
      relatedRecordsIndex,
      relatedPersonsIndex,
      customComment,
      isWIP,
      statusString,
      availableActions,
      updateWorkItemModal,
      closeModal,
      closeMessageOverride,
      showIncomingAttributes,
      showDestinationPersons,
      updateWorkItem,
      handleCloseWorkItem,
      hasPermission,
    };
  },
  head: {
    title: "Work Item",
  },
});
</script>

<style scoped lang="postcss">
th {
  @apply px-4 py-3;
}
td {
  @apply whitespace-nowrap px-4 py-4;
}

.masterrecord-label {
  @apply font-medium text-indigo-800;
}

.personrecord-label {
  @apply font-medium text-yellow-700;
}
</style>
