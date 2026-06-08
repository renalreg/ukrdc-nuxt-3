<template>
  <UPopover mode="hover" class="h-5 w-5">
    <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-gray-500 hover:text-gray-800" />
    <template #content>
      <div class="p-3 text-xs">
        <slot />
      </div>
    </template>
  </UPopover>
</template>
