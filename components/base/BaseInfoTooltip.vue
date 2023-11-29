<template>
  <VMenu class="flex items-center justify-center">
    <button class="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-800">
      <UIcon name="i-heroicons-information-circle" class="h-6 w-6" />
    </button>

    <!-- Popover content -->
    <template #popper>
      <slot />
    </template>
  </VMenu>
</template>
