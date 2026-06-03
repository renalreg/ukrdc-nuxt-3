<template>
  <li>
    <div class="block h-20 px-4 py-4 hover:bg-gray-50 sm:px-6">
      <div class="grid w-full min-w-0 grid-cols-3 md:gap-4 lg:grid-cols-4">
        <!-- Name, DoB, gender -->
        <USkeleton class="col-span-2 h-6 space-y-1" />
        <!-- National ID -->
        <USkeleton class="h-6 space-y-1" />
        <!-- Details (large breakpoint only) -->
        <USkeleton class="hidden h-6 space-y-1 lg:block" />
      </div>
    </div>
  </li>
</template>
