<template>
  <UBadge :color="color">
    {{ nationalidType.trim() }}
  </UBadge>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    nationalidType: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const color = computed(() => {
      if (props.nationalidType.includes("UKRDC")) {
        return "red";
      } else if (props.nationalidType.includes("NHS")) {
        return "blue";
      } else if (props.nationalidType.includes("CHI")) {
        return "purple";
      } else if (props.nationalidType.includes("HSC")) {
        return "green";
      } else {
        return "gray";
      }
    });

    return { color };
  },
});
</script>

<style></style>
