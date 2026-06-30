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
        return "error";
      } else if (props.nationalidType.includes("NHS")) {
        return "info";
      } else if (props.nationalidType.includes("CHI")) {
        return "secondary";
      } else if (props.nationalidType.includes("HSC")) {
        return "success";
      } else {
        return "neutral";
      }
    });

    return { color };
  },
});
</script>

<style></style>
