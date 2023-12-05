<template>
  <ul v-if="record.patient && record.patient.familydoctor">
    <li
      v-for="(info, index) in [record.patient.familydoctor.gpInfo, record.patient.familydoctor.gpPracticeInfo].filter(
        (x) => x,
      )"
      :key="`gp-info-${index}`"
      class="col-span-1"
    >
      <UCard v-if="info" class="sensitive w-full">
        <b>{{ info.type }} Information</b>
        <p>{{ info.gpname ?? "GP name not known" }}</p>
        <p>{{ info.street }}</p>
        <PostCodeLink v-if="info.postcode" :code="info.postcode" />
        <p>Contact {{ info.contactvalue }}</p>
      </UCard>
    </li>
    <li v-if="!record.patient.familydoctor.gpInfo">
      <UCard class="sensitive w-full">
        <b>GP Information</b>
        <p>{{ record.patient.familydoctor.gpname ?? "GP name not known" }}</p>
        <p>{{ record.patient.familydoctor.street }}</p>
        <PostCodeLink v-if="record.patient.familydoctor.postcode" :code="record.patient.familydoctor.postcode" />
        <p>Contact {{ record.patient.familydoctor.contactvalue }}</p>
      </UCard>
    </li>
  </ul>
</template>

<script lang="ts">
import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import PostCodeLink from "~/components/PostCodeLink.vue";

export default defineComponent({
  components: {
    PostCodeLink,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="postcss" scoped></style>
