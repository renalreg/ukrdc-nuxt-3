<template>
  <UCard>
    <BaseDescriptionListGrid>
      <BaseDescriptionListGridItem>
        <dt>Message ID</dt>
        <dd v-if="message && !isEmptyObject(message)">
          {{ message.messageId }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
      <BaseDescriptionListGridItem>
        <dt>Processed</dt>
        <dd v-if="message && !isEmptyObject(message)">
          {{ message.processed ? "Yes" : "No" }}
          {{ hasErrors ? "(with errors)" : "" }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
      <BaseDescriptionListGridItem>
        <dt>Channel</dt>
        <dd v-if="message && !isEmptyObject(message)">
          {{ channelName }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
    </BaseDescriptionListGrid>
    <slot></slot>
  </UCard>
</template>

<script lang="ts">
import { type ChannelMessageModel } from "@ukkidney/ukrdc-axios-ts";

import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import { messageHasErrors } from "~/helpers/mirthUtils";
import { isEmptyObject } from "~/helpers/objectUtils";

export default defineComponent({
  components: {
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
  },
  props: {
    message: {
      type: Object as () => ChannelMessageModel,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const channelName = computed(() => {
      let name = "";
      for (const msg of Object.values(props.message.connectorMessages)) {
        if (!name.includes(msg.channelName)) {
          name = name + "/" + msg.channelName;
        }
      }
      return name.substring(1);
    });

    const hasErrors = computed((): boolean => {
      return messageHasErrors(props.message);
    });

    return { channelName, hasErrors, isEmptyObject };
  },
});
</script>

<style scoped></style>
