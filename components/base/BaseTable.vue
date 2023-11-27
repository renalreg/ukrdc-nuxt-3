<template>
  <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 md:-mx-8">
    <div class="inline-block min-w-full overflow-hidden px-4 py-2 align-middle sm:px-6 md:px-8">
      <UCard :ui="{ body: { padding: '' } }">
        <table class="min-w-full table-auto divide-y divide-gray-300">
          <slot></slot>
        </table>
      </UCard>
    </div>
  </div>
</template>
