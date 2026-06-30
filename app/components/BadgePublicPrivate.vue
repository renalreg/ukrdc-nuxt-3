<template>
  <UBadge :color="color">
    {{ visibility }}
  </UBadge>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    visibility: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const color = computed(() => {
      if (props.visibility === "public") {
        return "success";
      } else if (props.visibility === "private") {
        return "info";
      } else {
        return "neutral";
      }
    });

    return { color };
  },
});
</script>
