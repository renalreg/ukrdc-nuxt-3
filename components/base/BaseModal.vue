<template>
  <UModal v-model="visible" :transition="false">
    <div class="p-4">
      <slot />
    </div>
  </UModal>
</template>

<script lang="ts">
import useModal from "~/composables/useModal";

export default defineComponent({
  setup() {
    const { visible, show, hide, toggle } = useModal();

    return {
      visible,
      show,
      hide,
      toggle,
    };
  },
});
</script>
