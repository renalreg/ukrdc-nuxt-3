<template>
  <UBadge :color="color">
    {{ status }}
  </UBadge>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    status: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const color = computed(() => {
      if (props.status === "pending") {
        return "info";
      } else if (props.status === "running") {
        return "warning";
      } else if (props.status === "finished") {
        return "success";
      } else if (props.status === "failed") {
        return "error";
      } else {
        return "neutral";
      }
    });

    return { color };
  },
});
</script>
