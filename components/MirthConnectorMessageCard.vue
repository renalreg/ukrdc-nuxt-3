<template>
  <BaseCard class="col-span-1 flex items-center justify-between truncate">
    <div class="flex-1 truncate px-4 py-2">
      <h3>
        {{ message.connectorName }}
      </h3>
      <p>{{ message.sendAttempts }} send attempts</p>

      <div class="mt-2">
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
        <UButton
          size="sm"
          color="white"
          class="float-right"
          label="View message"
          :to="`/mirth/messages/${message.channelId}/${message.messageId}/${message.orderId}`"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts">
import { type ConnectorMessageModel } from "@ukkidney/ukrdc-axios-ts";

import BaseCard from "~/components/base/BaseCard.vue";
import { connectorMessageError } from "~/helpers/mirthUtils";

export default defineComponent({
  components: {
    BaseCard,
  },
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
