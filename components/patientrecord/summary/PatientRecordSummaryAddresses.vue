<template>
  <ul>
    <li v-for="item in record.patient.addresses" :key="item.street" class="col-span-1">
      <UCard class="sensitive w-full"> <PatientRecordAddress :address="item" /> </UCard>
    </li>
  </ul>
</template>

<script lang="ts">

import { type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import PatientRecordAddress from "~/components/patientrecord/summary/PatientRecordAddress.vue";

export default defineComponent({
  components: {
    PatientRecordAddress,
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
