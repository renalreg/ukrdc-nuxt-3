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
        return "blue";
      } else if (props.status === "running") {
        return "amber";
      } else if (props.status === "finished") {
        return "green";
      } else if (props.status === "failed") {
        return "red";
      } else {
        return "gray";
      }
    });

    return { color };
  },
});
</script>
