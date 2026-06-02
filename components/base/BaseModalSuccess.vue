<template>
  <BaseModal ref="successModal">
    <div class="mb-2 flex flex-col gap-6 px-2 py-2 sm:flex-row">
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0"
        :class="danger ? 'bg-red-100' : 'bg-green-100'"
      >
        <UIcon
          :name="danger ? 'i-heroicons-exclamation-circle' : 'i-heroicons-check-circle'"
          class="h-6 w-6"
          :class="danger ? 'text-red-600' : 'text-green-600'"
        />
      </div>
      <div class="text-center sm:text-left">
        <h3 id="modal-headline" class="mb-4 text-lg font-medium leading-6 text-gray-900">
          {{ title }}
        </h3>
        <div>
          <p v-if="message">
            {{ message }}
          </p>
          <slot />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 px-4 sm:flex-row-reverse sm:px-0">
      <UButton :primary="true" :color="danger ? 'red' : 'indigo'" @click="confirm()">
        {{ confirmLabel }}
      </UButton>
    </div>
  </BaseModal>
</template>

<script lang="ts">
import BaseModal from "~/components/base/BaseModal.vue";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    BaseModal,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
      default: undefined,
    },
    confirmLabel: {
      type: String,
      required: false,
      default: "Go back",
    },
    danger: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["confirm"],
  setup(_, { emit }) {
    const successModal = ref<ModalInterface>();

    const visible = computed(() => {
      return successModal.value?.visible || false;
    });

    function show(): void {
      return successModal.value?.show();
    }

    function hide(): void {
      return successModal.value?.hide();
    }

    function toggle(): void {
      return successModal.value?.toggle();
    }

    function confirm(): void {
      emit("confirm");
      hide();
    }

    return {
      successModal,
      visible,
      confirm,
      show,
      hide,
      toggle,
    };
  },
});
</script>
