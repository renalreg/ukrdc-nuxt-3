<template>
  <div>
    <div class="mb-6">
      <h1 v-if="message">Message {{ message.messageId }}</h1>
      <USkeleton v-else class="mb-2 h-8 w-1/4" />
    </div>

    <!-- Header card -->
    <MirthMessageCard class="mb-6" :message="message" />

    <NuxtPage v-if="message" :message="message" />
  </div>
</template>

<script lang="ts">
import { type ChannelMessageModel } from "@ukkidney/ukrdc-axios-ts";

import MirthMessageCard from "~/components/MirthMessageCard.vue";
import useApi from "~/composables/useApi";
import { getFirstOrValue } from "~/helpers/queryUtils";

export default defineComponent({
  components: {
    MirthMessageCard,
  },
  setup() {
    const route = useRoute();
    const { mirthApi } = useApi();

    // Head
    useHead({
      title: `Mirth message ${route.params.id}`,
    });

    // Data refs
    const message = ref<ChannelMessageModel>();

    // Data fetching
    onMounted(() => {
      mirthApi
        .getMirthChannelMessage({
          channelId: getFirstOrValue(route.params.channel),
          messageId: getFirstOrValue(route.params.id),
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
    };
  },
  head: {
    title: "Mirth Message",
  },
});
</script>
