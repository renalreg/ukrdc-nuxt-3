<template>
  <div>
    <!-- Header card -->
    <UCard class="mb-4">
      <BaseDescriptionListGrid>
        <BaseDescriptionListGridItem>
          <dt>Status</dt>
          <dd v-if="message">
            <BadgeMessageStatus class="mr-2 flex-shrink" :message="message" />
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Received</dt>
          <dd v-if="message">
            {{ message.received ? formatDate(message.received) : "Unknown" }}
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Facility</dt>
          <SendingFacilityLink v-if="message" :code="message.facility" />
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>

        <BaseDescriptionListGridItem>
          <dt>Channel</dt>
          <dd v-if="message" class="flex items-center gap-1">
            <span>{{ message.mirthChannel ? message.mirthChannel : message.mirthChannelId }}</span>
            <BaseInfoTooltip class="inline">
              <p>This is the internal UKRDC channel responsible for processing this message.</p>
              <p>The channel may be important when debugging unexpected errors.</p>
            </BaseInfoTooltip>
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
      </BaseDescriptionListGrid>
    </UCard>

    <UCard v-if="message" class="mb-4">
      <template #header>
        <h2>Files</h2>
      </template>
      <BaseAttachment :filename="message.filename ?? `${message.facility}-${message.id}.txt`">
        <UButton variant="link" :to="`/messages/${message.id}/source`"> View </UButton>
        <UButton variant="link" @click="downloadMessageSource"> Download </UButton>
      </BaseAttachment>
    </UCard>

    <UCard v-if="message && message.error" class="mb-4">
      <template #header>
        <h2>Error message</h2>
      </template>
      <div class="whitespace-pre-wrap font-mono">
        {{ messageText }}
      </div>
    </UCard>

    <!-- Related Patient Records card -->
    <UCard v-if="patientRecords.length > 0" :ui="{ body: { padding: '' } }" class="mt-4">
      <template #header>
        <h2>Related Records</h2>
      </template>
      <ul class="divide-y divide-gray-300">
        <li v-for="item in patientRecords" :key="item.pid">
          <PatientRecordsListItem :item="item" :show-manage-menu="false" />
        </li>
      </ul>
    </UCard>

    <!-- Related Work Items card -->
    <UCard v-if="workItems.length > 0" :ui="{ body: { padding: '' } }" class="mt-4">
      <template #header>
        <h2>Related Work Items</h2>
      </template>
      <ul class="divide-y divide-gray-300">
        <li v-for="item in workItems" :key="item.id" :item="item" class="hover:bg-gray-50">
          <NuxtLink :to="`/workitems/${item.id}`">
            <WorkItemsListItem :item="item" />
          </NuxtLink>
        </li>
      </ul>
    </UCard>

    <!-- Mirth Messages card -->
    <UCard v-if="hasPermission('ukrdc:mirth:read')" :ui="{ body: { padding: '' } }" class="mt-4">
      <template #header>
        <h2>Mirth Messages</h2>
      </template>
      <ul class="divide-y divide-gray-300">
        <li v-if="mirthMessage" class="hover:bg-gray-50">
          <NuxtLink :to="`/mirth/messages/${mirthMessage.channelId}/${mirthMessage.messageId}`">
            <MirthMessageListItem :message="mirthMessage" />
          </NuxtLink>
        </li>
        <li v-else-if="mirthMessage === undefined">
          <BaseSkeleListItem />
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script lang="ts">
import {
  type ChannelMessageModel,
  type MessageSchema,
  type PatientRecordSummarySchema,
  type WorkItemSchema,
} from "@ukkidney/ukrdc-axios-ts";

import BadgeMessageStatus from "~/components/BadgeMessageStatus.vue";
import BaseAttachment from "~/components/base/BaseAttachment.vue";
import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import BaseInfoTooltip from "~/components/base/BaseInfoTooltip.vue";
import BaseSkeleListItem from "~/components/base/BaseSkeleListItem.vue";
import MirthMessageListItem from "~/components/MirthMessageListItem.vue";
import PatientRecordsListItem from "~/components/patientrecord/PatientRecordsListItem.vue";
import SendingFacilityLink from "~/components/SendingFacilityLink.vue";
import WorkItemsListItem from "~/components/workitem/WorkItemsListItem.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import useSensitive from "~/composables/useSensitive";
import { formatDate } from "~/helpers/dateUtils";
import { saveAs } from "~/helpers/fileUtils";

export default defineComponent({
  components: {
    BaseSkeleListItem,
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
    BaseAttachment,
    BaseInfoTooltip,
    SendingFacilityLink,
    PatientRecordsListItem,
    BadgeMessageStatus,
    MirthMessageListItem,
    WorkItemsListItem,
  },
  props: {
    message: {
      type: Object as () => MessageSchema,
      required: true,
    },
  },
  setup(props) {
    const { hasPermission } = usePermissions();
    const { messagesApi, mirthApi } = useApi();
    const { sensitiveNumbers } = useSensitive();

    // Data refs
    const mirthMessage = ref<ChannelMessageModel | null | undefined>(undefined);
    const workItems = ref([] as WorkItemSchema[]);
    const patientRecords = ref([] as PatientRecordSummarySchema[]);

    const messageText = computed(() => {
      return sensitiveNumbers(props.message.error?.trim());
    });

    // Data fetching

    function getMessageData() {
      // Get auxilalry record data
      if (hasPermission("ukrdc:records:read")) {
        messagesApi
          .getMessagePatientrecords({
            messageId: props.message.id,
          })
          .then((response) => {
            patientRecords.value = response.data;
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          });
      }
      if (hasPermission("ukrdc:workitems:read")) {
        messagesApi
          .getMessageWorkitems({
            messageId: props.message.id,
          })
          .then((response) => {
            workItems.value = response.data;
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          });
      }

      // Conditionally get the Mirth message data
      if (hasPermission("ukrdc:mirth:read")) {
        mirthApi
          .getMirthChannelMessage({
            messageId: props.message.mirthMessageId,
            channelId: props.message.mirthChannelId,
          })
          .then((response) => {
            mirthMessage.value = response.data;
          })
          .catch(() => {
            mirthMessage.value = null;
          });
      }
    }

    function downloadMessageSource() {
      messagesApi
        .getMessageSource({
          messageId: props.message.id,
        })
        .then((response) => {
          const blob = new Blob([response.data.content ? response.data.content : ""]);
          saveAs(blob, props.message.filename ?? `${props.message.facility}-{message.id}.txt`);
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    onMounted(() => {
      getMessageData();
    });

    return {
      patientRecords,
      workItems,
      mirthMessage,
      messageText,
      formatDate,
      downloadMessageSource,
      hasPermission,
    };
  },
});
</script>
