<template>
  <UModal v-model="visible" :transition="false">
    <div class="p-4">
      <slot />
    </div>
  </UModal>
</template>

<script lang="ts">
import useCustomModal from "~/composables/useCustomModal";

export default defineComponent({
  setup() {
    const { visible, show, hide, toggle } = useCustomModal();

    return {
      visible,
      show,
      hide,
      toggle,
    };
  },
});
</script>
