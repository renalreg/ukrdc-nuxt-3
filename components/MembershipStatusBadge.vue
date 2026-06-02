<template>
  <div v-if="badgeStatus !== 0">
    <UBadge v-if="badgeStatus === 1" color="green">Active</UBadge>
    <UBadge v-if="badgeStatus === 2" color="red">Closed</UBadge>
    <UBadge v-if="badgeStatus === 3" color="amber">Mixed</UBadge>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

enum MembershipStatusEnum {
  Open = 1,
  Closed = 2,
  Mixed = 3,
  Unknown = 0,
}
export default defineComponent({
  props: {
    item: {
      type: Object as () => PatientRecordSummarySchema,
      required: true,
    },
  },
  setup(props) {
    const badgeStatus = computed(() => {
      if (props.item.programMemberships) {
        const open = props.item.programMemberships.filter((pm) => !pm.toTime).length;
        const closed = props.item.programMemberships.filter((pm) => pm.toTime).length;
        if (open > 0 && closed > 0) {
          return MembershipStatusEnum.Mixed;
        } else if (open > 0) {
          return MembershipStatusEnum.Open;
        } else if (closed > 0) {
          return MembershipStatusEnum.Closed;
        } else {
          return MembershipStatusEnum.Unknown;
        }
      } else {
        return MembershipStatusEnum.Unknown;
      }
    });

    return { badgeStatus };
  },
});
</script>
