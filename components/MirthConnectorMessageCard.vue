<template>
  <UCard class="col-span-1">
    <div class="truncate">
      <h3>
        {{ message.connectorName }}
      </h3>
      <p>{{ message.sendAttempts }} send attempts</p>

      <div class="mt-2 flex w-full items-end">
        <div class="flex-1 flex-grow">
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
        </div>

        <div class="flex-0">
          <UButton
            size="sm"
            label="View message"
            :to="`/mirth/messages/${message.channelId}/${message.messageId}/${message.orderId}`"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts">
import { type ConnectorMessageModel } from "@ukkidney/ukrdc-axios-ts";

import { connectorMessageError } from "~/helpers/mirthUtils";

export default defineComponent({
  props: {
    message: {
      type: Object as () => ConnectorMessageModel,
      required: true,
    },
  },

  setup(props) {
    const errorMessage = computed(() => {
      return connectorMessageError(props.message);
    });

    return { errorMessage };
  },
});
</script>
