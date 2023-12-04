<template>
  <div class="flex w-full items-center gap-2 pb-4 md:mx-auto">
    <form class="flex-1" @submit.prevent="$emit('submit')">
      <UInput
        size="lg"
        :autofocus="focus"
        class="w-full"
        placeholder="Search"
        leading-icon="i-heroicons-magnifying-glass-20-solid"
        type="search"
        :model-value="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </form>
    <UButton v-if="showButton" size="lg" @click="$emit('submit')">Search</UButton>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    focus: {
      type: Boolean,
      required: false,
      default: false,
    },
    showButton: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ["update:modelValue", "submit"],
});
</script>
