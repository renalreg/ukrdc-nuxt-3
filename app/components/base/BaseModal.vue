<template>
  <Teleport to="body">
    <div v-if="visible">
      <UModal v-model:open="visible">
        <template #content>
          <div class="p-4">
            <slot />
          </div>
        </template>
      </UModal>
    </div>
  </Teleport>
</template>

<script lang="ts">
import useCustomModal from "~/composables/useCustomModal";

export default defineComponent({
  setup() {
    const { visible, show, hide, toggle } = useCustomModal();
    return { visible, show, hide, toggle };
  },
});
</script>
