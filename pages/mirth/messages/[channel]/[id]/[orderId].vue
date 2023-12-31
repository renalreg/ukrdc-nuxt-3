<template>
  <div>
    <UCard class="mb-6">
      <BaseDescriptionListGrid>
        <BaseDescriptionListGridItem>
          <dt>Connector Name</dt>
          <dd v-if="connectorMessage">
            {{ connectorMessage.connectorName }}
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Send Attempts</dt>
          <dd v-if="connectorMessage">
            {{ connectorMessage.sendAttempts }}
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
        <BaseDescriptionListGridItem>
          <dt>Status</dt>
          <dd v-if="connectorMessage">
            <span
              v-if="errorMessage"
              class="inline-block flex-shrink-0 rounded-sm bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800"
              >Error</span
            >
            <span
              v-else
              class="inline-block flex-shrink-0 rounded-sm bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800"
              >Success</span
            >
          </dd>
          <USkeleton v-else class="h-6 w-full" />
        </BaseDescriptionListGridItem>
      </BaseDescriptionListGrid>
      <slot></slot>
    </UCard>

    <UTabs :items="tabs">
      <template #item="{ item }">
        <div class="flex-1">
          <div v-if="item.key == 'metadata'" id="viewerMetadata">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <UCard
                v-for="(value, key) in nonNullMetadata"
                :key="key"
                class="relative flex items-center space-x-2"
                :class="key === 'ERROR' ? 'border-2 border-red-500' : ''"
              >
                <div class="min-w-0 flex-1">
                  <span class="absolute inset-0" aria-hidden="true" />
                  <p class="font-medium text-gray-900">{{ key }}</p>
                  <p class="sensitive line-clamp-3 text-gray-500">
                    {{ value }}
                  </p>
                </div>
              </UCard>
            </div>
          </div>

          <div v-for="(connectorMessageData, type) in availableconnectorMessageData" :key="type">
            <UCard v-if="item.key == type" :ui="{ body: { padding: '' } }">
              <BaseCodeReader
                :content="connectorMessageData.content ?? ''"
                :content-type="connectorMessageData.dataType"
                class="sensitive"
              />
            </UCard>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts">
import type { TabItem } from "@nuxt/ui/dist/runtime/types/tabs";
import {
  type ChannelMessageModel,
  type ConnectorMessageData,
  type ConnectorMessageModel,
} from "@ukkidney/ukrdc-axios-ts";

import BaseCodeReader from "~/components/base/BaseCodeReader.vue";
import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import { connectorMessageError } from "~/helpers/mirthUtils";
import { getFirstOrValue } from "~/helpers/queryUtils";

interface ConnectorMessageDataTabs {
  raw: ConnectorMessageData;
  encoded: ConnectorMessageData;
  sent: ConnectorMessageData;
  response: ConnectorMessageData;
}

export default defineComponent({
  components: {
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
    BaseCodeReader,
  },
  props: {
    message: {
      type: Object as () => ChannelMessageModel,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();

    // Data refs
    const connectorMessage = computed(() => {
      const orderId = parseInt(getFirstOrValue(route.params.orderId));
      return props.message.connectorMessages[orderId] as ConnectorMessageModel;
    });
    const formatconnectorMessage = ref(true);

    // Manage viewer tabs
    const currentTab = ref<string>("metadata");

    const tabs = computed<TabItem[]>(() => {
      const tabs = [
        {
          label: "metadata",
          key: "metadata",
        },
      ];
      for (const key of Object.keys(availableconnectorMessageData.value)) {
        tabs.push({
          label: key,
          key,
        });
      }
      return tabs;
    });

    watch(connectorMessage, () => {
      currentTab.value = tabs.value[0].value.toString();
    });

    // Handle connectorMessage and metadata
    const availableconnectorMessageData = computed<ConnectorMessageDataTabs>(() => {
      const tabs = {} as ConnectorMessageDataTabs;
      if (connectorMessage.value) {
        if (connectorMessage.value.raw) {
          tabs.raw = connectorMessage.value.raw;
        }
        if (connectorMessage.value.encoded) {
          tabs.encoded = connectorMessage.value.encoded;
        }
        if (connectorMessage.value.sent) {
          tabs.sent = connectorMessage.value.sent;
        }
        if (connectorMessage.value.response) {
          tabs.response = connectorMessage.value.response;
        }
      }
      return tabs;
    });

    const nonNullMetadata = computed<{ [key: string]: string }>(() => {
      if (connectorMessage.value?.metaDataMap) {
        return Object.fromEntries(Object.entries(connectorMessage.value.metaDataMap).filter(([_, v]) => v != null));
      } else {
        return {};
      }
    });

    const errorMessage = computed(() => {
      return connectorMessage.value ? connectorMessageError(connectorMessage.value) : null;
    });

    return {
      connectorMessage,
      currentTab,
      tabs,
      nonNullMetadata,
      availableconnectorMessageData,
      formatconnectorMessage,
      errorMessage,
    };
  },
  head: {
    title: "Mirth Message",
  },
});
</script>
