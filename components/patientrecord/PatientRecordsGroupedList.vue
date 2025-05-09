<template>
  <div class="divide-y divide-gray-300">
    <div v-if="groupedRecords.data.length > 0" class="patientrecords-list-header">
      <h4 class="flex-grow">Data feeds</h4>
      <div class="mr-2 flex-grow-0">
        <PatientRecordSyncAllMenu
          :records="groupedRecords.data"
          :has-pkb-membership="hasPKBMembership"
          @refresh="$emit('refresh')"
        />
      </div>
      <div class="mr-2 flex-grow-0">
        <PatientRecordSyncAllMenuMRC
          :records="groupedRecords.data"
          :has-mrc-membership="hasMRCMembership"
          @refresh="$emit('refresh')"
        />
      </div>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.data"
      :key="item.pid + '_data'"
      :item="item"
      :show-radar-sync="hasRADARMembership"
      :show-pkb-sync="hasPKBMembership"
      @deleted="$emit('refresh')"
    />

    <div v-if="groupedRecords.surveys.length > 0" class="patientrecords-list-header">
      <h4>Survey feeds</h4>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.surveys"
      :key="item.pid + '_survey'"
      :item="item"
      :show-radar-sync="hasRADARMembership"
      :show-pkb-sync="hasPKBMembership"
      @deleted="$emit('refresh')"
    />

    <div v-if="groupedRecords.migrated.length > 0" class="patientrecords-list-header">
      <h4>Historic Migrated Data</h4>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.migrated"
      :key="item.pid + '_mig'"
      :item="item"
      :show-radar-sync="hasRADARMembership"
      :show-pkb-sync="hasPKBMembership"
      @deleted="$emit('refresh')"
    />

    <div class="patientrecords-list-header">
      <h4 class="flex-grow">Membership Records</h4>
      <div class="mr-2 flex-grow-0">
        <PatientRecordMembershipsMenu
          :records="records"
          :show-create-pkb-membership="!hasPKBMembership"
          :show-create-mrc-membership="!hasMRCMembership"
          @refresh="$emit('refresh')"
        />
      </div>
    </div>
    <div v-if="groupedRecords.memberships.length < 1" class="py-2 pl-4 sm:pl-6">
      <p>No membership records</p>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.memberships"
      :key="item.pid + '_membership'"
      :item="item"
      @deleted="$emit('refresh')"
    />

    <div v-if="groupedRecords.ukrr.length > 0" class="patientrecords-list-header">
      <h4>Registry Data Records</h4>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.ukrr"
      :key="item.pid + '_ukrr'"
      :item="item"
      @deleted="$emit('refresh')"
    />

    <div v-if="groupedRecords.informational.length > 0" class="patientrecords-list-header">
      <h4>Informational Records</h4>
    </div>
    <PatientRecordsListItem
      v-for="item in groupedRecords.informational"
      :key="item.pid + '_informational'"
      :item="item"
      @deleted="$emit('refresh')"
    />
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import PatientRecordMembershipsMenu from "~/components/patientrecord/PatientRecordMembershipsMenu.vue";
import PatientRecordsListItem from "~/components/patientrecord/PatientRecordsListItem.vue";
import PatientRecordSyncAllMenu from "~/components/patientrecord/PatientRecordSyncAllMenu.vue";
import PatientRecordSyncAllMenuMRC from "~/components/patientrecord/PatientRecordSyncAllMenuMRC.vue";
import usePermissions from "~/composables/usePermissions";
import { isData, isInformational, isMembership, isMigrated, isSurvey, isUKRR } from "~/helpers/recordUtils";

interface PRGroups {
  data: PatientRecordSummarySchema[];
  surveys: PatientRecordSummarySchema[];
  migrated: PatientRecordSummarySchema[];
  memberships: PatientRecordSummarySchema[];
  ukrr: PatientRecordSummarySchema[];
  informational: PatientRecordSummarySchema[];
}

export default defineComponent({
  components: {
    PatientRecordsListItem,
    PatientRecordMembershipsMenu,
    PatientRecordSyncAllMenu,
    PatientRecordSyncAllMenuMRC,
  },
  props: {
    records: {
      type: Array as () => PatientRecordSummarySchema[],
      required: true,
    },
  },
  emits: ["refresh"],
  setup(props) {
    const { hasPermission } = usePermissions();

    const groupedRecords = computed<PRGroups>(() => {
      if (!props.records) {
        return {
          data: [],
          surveys: [],
          migrated: [],
          memberships: [],
          ukrr: [],
          informational: [],
        } as PRGroups;
      }

      return {
        data: props.records.filter(isData),
        surveys: props.records.filter(isSurvey),
        migrated: props.records.filter(isMigrated),
        memberships: props.records.filter(isMembership),
        ukrr: props.records.filter(isUKRR),
        informational: props.records.filter(isInformational),
      } as PRGroups;
    });

    const hasPKBMembership = computed(() => {
      return props.records.some((r) => r.sendingfacility === "PKB");
    });

    const hasMRCMembership = computed(() => {
      return props.records.some((r) => r.sendingfacility === "MRC");
    });

    const hasRADARMembership = computed(() => {
      return props.records.some((r) => r.sendingextract === "RADAR");
    });

    return {
      groupedRecords,
      hasPKBMembership,
      hasMRCMembership,
      hasRADARMembership,
      hasPermission,
    };
  },
});
</script>

<style lang="postcss" scoped>
.patientrecords-list-header {
  @apply flex h-10 items-center bg-gray-50 py-1 pl-4 sm:pl-6;
}
</style>
