<template>
  <div class="mb-4">
    <div v-if="isLoading">
      <UAlert icon="i-heroicons-arrow-down-on-square-20-solid" title="Loading latest data file. Please wait..." />
    </div>
    <div v-else-if="message" class="group">
      <UAlert
        v-if="message.msgStatus === 'ERROR' && latestMessageInfo"
        color="red"
        icon="i-heroicons-exclamation-triangle-20-solid"
        :title="latestMessageInfo"
        class="mb-4"
      />
      <UAlert
        v-else
        icon="i-heroicons-information-circle-20-solid"
        :title="latestMessageInfo ?? 'No message information available'"
      />
    </div>
    <div v-else>
      <UAlert color="orange" icon="i-heroicons-exclamation-triangle-20-solid" :title="fallbackMessage" />
    </div>
  </div>
</template>

<script lang="ts">
import { type MinimalMessageSchema } from "@ukkidney/ukrdc-axios-ts";

import useSensitive from "~/composables/useSensitive";
import { formatDate } from "~/helpers/dateUtils";

const sentinel = Object();

export default defineComponent({
  props: {
    message: {
      type: Object as () => MinimalMessageSchema,
      required: false,
      default: null,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    fallbackMessage: {
      type: String,
      required: false,
      default: "No new patient data received in the last year",
    },
  },
  setup(props) {
    const { sensitive } = useSensitive();

    const latestMessageInfo = computed(() => {
      if (!props.message) {
        return null;
      }
      if (props.message.msgStatus === "ERROR") {
        if (props.message.received) {
          return `Latest file from ${props.message.facility} was ${sensitive(
            props.message.filename,
          )}, failed on ${formatDate(props.message.received, false)}`;
        } else {
          return `Latest file from ${props.message.facility} was ${sensitive(props.message.filename)}, failed`;
        }
      }
      if (props.message.received) {
        return `Latest file from ${props.message.facility} was ${sensitive(
          props.message.filename,
        )}, recieved on ${formatDate(props.message.received, false)}`;
      } else {
        return `Latest file from ${props.message.facility} was ${sensitive(props.message.filename)}`;
      }
    });

    return { latestMessageInfo, sentinel };
  },
});
</script>
