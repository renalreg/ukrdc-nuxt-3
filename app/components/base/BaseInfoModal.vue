<template>
  <div>
    <UTooltip :text="tooltip">
      <UButton
        variant="ghost"
        color="neutral"
        square
        icon="i-heroicons-information-circle"
        class="text-gray-500 hover:text-gray-800"
        @click="modal?.show()"
      />
    </UTooltip>

    <BaseModal ref="modal">
      <slot />
    </BaseModal>
  </div>
</template>

<script lang="ts">
import BaseModal from "~/components/base/BaseModal.vue";
import type { ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: { BaseModal },
  props: {
    tooltip: {
      type: String,
      required: false,
      default: "Click to show info",
    },
  },
  setup() {
    const modal = ref<ModalInterface>();
    return { modal };
  },
});
</script>
