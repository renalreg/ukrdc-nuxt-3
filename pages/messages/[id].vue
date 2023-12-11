<template>
  <div>
    <div class="mb-6 flex items-end gap-4">
      <div class="flex-grow">
        <h1 v-if="message">
          {{ message.msgStatus === "ERROR" ? "Error" : "Message" }} {{ message.id }} from {{ message.facility }}
        </h1>
        <USkeleton v-else class="mb-2 h-8 w-1/4" />
        <h5 v-if="message" class="line-clamp-1">
          {{ messageSummary }}
        </h5>
        <USkeleton v-else class="h-4 w-1/2" />
      </div>
    </div>

    <NuxtPage v-if="message" :message="message" />
  </div>
</template>

<script lang="ts">
import { type MessageSchema } from "@ukkidney/ukrdc-axios-ts";

import useApi from "~/composables/useApi";
import useSensitive from "~/composables/useSensitive";
import { makeMessageSummary } from "~/helpers/messageUtils";

export default defineComponent({
  setup() {
    const route = useRoute();
    const { messagesApi } = useApi();
    const { sensitiveNumbers } = useSensitive();

    // Head
    useHead({
      title: `Message ${route.params.id}`,
    });

    // Data refs

    const message = ref<MessageSchema>();

    const messageSummary = computed(() => {
      if (message.value) {
        return sensitiveNumbers(makeMessageSummary(message.value));
      }
      return "";
    });

    // Data fetching

    onMounted(() => {
      messagesApi
        .getMessage({
          messageId: Number(route.params.id),
        })
        .then((response) => {
          message.value = response.data;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    return {
      message,
      messageSummary,
    };
  },
  head: {
    title: "Message",
  },
});
</script>
