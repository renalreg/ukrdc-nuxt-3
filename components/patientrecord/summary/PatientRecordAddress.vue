<template>
  <div v-if="address" class="sensitive">
    <p>
      <b>{{ address.street }}</b>
    </p>

    <p v-if="address.town">{{ address.town }}</p>
    <p v-if="address.county">
      {{ address.county }}
    </p>
    <PostCodeLink v-if="address.postcode" :code="address.postcode" />
    <p v-if="address.countryDescription">
      {{ address.countryDescription }}
    </p>
    <p v-if="address.fromTime">Since {{ formatDate(address.fromTime, false) }}</p>
    <UBadge v-if="!address.toTime" color="green">Active</UBadge>
    <UBadge v-else color="red">Inactive since {{ formatDate(address.toTime, false) }}</UBadge>
  </div>
  <p v-else>No address on record</p>
</template>

<script lang="ts">
import { type AddressSchema } from "@ukkidney/ukrdc-axios-ts";

import PostCodeLink from "~/components/PostCodeLink.vue";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    PostCodeLink,
  },
  props: {
    address: {
      type: Object as () => AddressSchema,
      required: false,
      default: undefined,
    },
  },
  setup() {
    return {
      formatDate,
    };
  },
});
</script>
