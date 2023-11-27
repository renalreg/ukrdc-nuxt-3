<template>
  <li>
    <div class="block h-20 hover:bg-gray-50 px-4 py-4 sm:px-6">
      <div class="grid w-full min-w-0 grid-cols-3 md:gap-4 lg:grid-cols-4">
        <!-- Name, DoB, gender -->
        <USkeleton class="col-span-2 space-y-1 h-6" />
        <!-- National ID -->
        <USkeleton class="space-y-1 h-6" />
        <!-- Details (large breakpoint only) -->
        <USkeleton class="hidden space-y-1 lg:block h-6" />
      </div>
    </div>
  </li>
</template>
