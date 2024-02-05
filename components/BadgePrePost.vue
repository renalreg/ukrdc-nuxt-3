<template>
  <UBadge :color="color">
    {{ prePostString }}
  </UBadge>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    prePost: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const color = computed(() => {
      if (props.prePost === "PRE") {
        return "red";
      } else if (props.prePost === "POST") {
        return "blue";
      } else if (props.prePost === "NA") {
        return "white";
      } else {
        return "gray";
      }
    });

    const prePostString = computed(() => {
      if (props.prePost === "PRE") {
        return "Pre-Dialysis";
      } else if (props.prePost === "POST") {
        return "Post-Dialysis";
      } else if (props.prePost === "NA") {
        return "N/A";
      } else {
        return "Unknown";
      }
    });
    return { prePostString, color };
  },
});
</script>
