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
          channelId: route.params.channel,
          messageId: route.params.id,
        })
        .then((response) => {
          message.value = response.data;
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
