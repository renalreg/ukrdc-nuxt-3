<template>
  <UCard>
    <template #header>
      <h2>Details</h2>
    </template>
    <BaseDescriptionListGrid :cols="2">
      <BaseDescriptionListGridItem>
        <dt>Last Updated</dt>
        <dd v-if="item">
          {{ item.lastUpdated ? formatDate(item.lastUpdated) : "Never" }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
      <BaseDescriptionListGridItem>
        <dt>Last Updated By</dt>
        <dd v-if="item">
          {{ item.updatedBy ? item.updatedBy : "N/A" }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
      <BaseDescriptionListGridItem class="sm:col-span-2">
        <dt>Comments</dt>
        <dd v-if="item">
          {{ item.updateDescription ? item.updateDescription : "None" }}
        </dd>
        <USkeleton v-else class="h-6 w-full" />
      </BaseDescriptionListGridItem>
    </BaseDescriptionListGrid>
  </UCard>
</template>

<script lang="ts">
import { type WorkItemExtendedSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
  },
  props: {
    item: {
      type: Object as () => WorkItemExtendedSchema,
      required: false,
      default: undefined,
    },
  },
  setup() {
    return { formatDate };
  },
});
</script>
