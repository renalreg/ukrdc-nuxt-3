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
        return "red";
      } else if (props.operation.includes("READ")) {
        return "blue";
      } else if (props.operation.includes("UPDATE")) {
        return "purple";
      } else if (props.operation.includes("CREATE")) {
        return "green";
      } else {
        return "gray";
      }
    });

    return { color };
  },
});
</script>
