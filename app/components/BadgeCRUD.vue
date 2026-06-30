<template>
  <UBadge :color="color">
    {{ operation.trim() }}
  </UBadge>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    operation: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const color = computed(() => {
      if (props.operation.includes("DELETE")) {
        return "error";
      } else if (props.operation.includes("READ")) {
        return "info";
      } else if (props.operation.includes("UPDATE")) {
        return "primary";
      } else if (props.operation.includes("CREATE")) {
        return "success";
      } else {
        return "neutral";
      }
    });

    return { color };
  },
});
</script>
