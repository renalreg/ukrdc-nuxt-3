<template>
  <UCard :ui="{ body: { padding: '' } }" class="flex">
    <div class="flex">
      <div
        class="flex w-16 shrink-0 items-center justify-center overflow-visible rounded-l-md font-medium text-white"
        :class="[organization == 'UKKA' ? 'bg-red-700' : 'bg-indigo-600']"
      >
        {{ numbertype }}
      </div>
      <div class="flex min-w-0 flex-1 items-center justify-between truncate">
        <div class="min-w-0 flex-1 truncate px-2 py-2">
          <div class="block truncate">
            <UTooltip :text="number">
              <b class="sensitive block truncate">
                {{ number }}
              </b>
            </UTooltip>
          </div>

          <p class="sensitive">{{ organization }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    number: {
      type: String,
      required: true,
    },
    numbertype: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
  },
});
</script>
