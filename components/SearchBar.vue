<template>
  <div class="flex items-center gap-2 pb-4 md:mx-auto w-full">
    <form @submit.prevent="$emit('submit')" class="flex-1">
      <UInput
        size="lg"
        :autofocus="focus"
        class="w-full"
        placeholder="Search"
        leading-icon="i-heroicons-magnifying-glass-20-solid"
        type="search"
        :modelValue="modelValue"
        v-on:update:modelValue="$emit('update:modelValue', $event)"
      />
    </form>
    <UButton size="lg" v-if="showButton" @click="$emit('submit')"
      >Search</UButton 
    >
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
  emits: [
    'update:modelValue',
    'submit'
  ]
});
</script>
