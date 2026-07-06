<!-- Given a sending facility code, creates and formats a link to the facility overview page -->

<template>
  <p class="truncate capitalize">
    <NuxtLink v-if="code && !isTba" class="hover:underline" :to="`/facilities/${code}`">{{ code }}</NuxtLink>
    <NuxtLink v-else-if="isTba" class="hover:underline" to="" @click.prevent="showTbaToast">{{ code }}</NuxtLink>
    <span v-else>Unknown Facility</span>
  </p>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    code: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const toast = useToast();

    const isTba = computed(() => props.code?.trim().toLowerCase() === "tba");

    const showTbaToast = () => {
      toast.add({
        title: "Facility not yet available",
        description: "This healthcare facility code is still to be assigned (TBA) and has no link yet.",
        color: "warning",
      });
    };

    return {
      isTba,
      showTbaToast,
    };
  },
});
</script>
