<!--
Shows a Link Record as a Person card and a Master Record card.
Includes a header with the Link Record ID and functionality to Unlink the records.
-->

<template>
  <div>
    <UCard class="mb-2 flex items-center p-2">
      <h5>Link Record {{ record.id }}</h5>
    </UCard>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PersonRecordCard :record="record.person" />
      <NuxtLink :to="`/masterrecords/${record.masterRecord.id}`">
        <MasterRecordCard :record="record.masterRecord" />
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts">
import { type LinkRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseModal from "~/components/base/BaseModal.vue";
import MasterRecordCard from "~/components/MasterRecordCard.vue";
import PersonRecordCard from "~/components/PersonRecordCard.vue";
import { formatGender } from "~/helpers/codeUtils";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseModal,
    PersonRecordCard,
    MasterRecordCard,
  },
  props: {
    record: {
      type: Object as () => LinkRecordSchema,
      required: true,
    },
  },
  setup() {
    return {
      formatGender,
      formatDate,
    };
  },
});
</script>

<style></style>
