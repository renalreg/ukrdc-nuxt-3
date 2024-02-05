<template>
  <UBadge :color="color">
    {{ message.msgStatus }}
  </UBadge>
</template>

<script lang="ts">
import { type MessageSchema } from "@ukkidney/ukrdc-axios-ts";

export default defineComponent({
  props: {
    message: {
      type: Object as () => MessageSchema,
      required: true,
    },
  },
  setup(props) {
    const color = computed(() => {
      if (props.message.msgStatus === "ERROR") {
        return "red";
      } else if (props.message.msgStatus === "RECEIVED") {
        return "amber";
      }
      return "green";
    });

    return { color };
  },
});
</script>
