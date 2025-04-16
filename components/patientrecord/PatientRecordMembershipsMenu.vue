<template>
  <div>
    <BaseModalConfirm
      ref="createPkbMembershipConfirm"
      title="Create PKB Membership"
      :danger="false"
      @confirm="createPkbMembership()"
    >
      <p class="mb-2">Are you sure you want to create a PKB membership for this patient?</p>
      <p>
        Data will only be sent to PKB if/when at least one of the patient's renal units enrolls in PKB data sending.
      </p>
    </BaseModalConfirm>
    <BaseModalSuccess
      ref="createPkbMembershipSuccess"
      title="PKB Membership Created"
      confirm-label="Go back to records"
      @confirm="$emit('refresh')"
    >
      <p class="mb-4"><b>No data has been automatically sent</b></p>
      <p class="inline">To send data, click</p>
      <UButton label="Sync to PKB" size="xs" icon="i-heroicons-cloud-arrow-up-20-solid" class="cursor-default" />
      <p class="inline">from the Data Feeds section.</p>
    </BaseModalSuccess>

    <BaseModalConfirm
      ref="createMrcMembershipConfirm"
      title="Create MRC Membership"
      :danger="false"
      @confirm="createMrcMembership()"
    >
      <p class="mb-2">Are you sure you want to create a MRC membership for this patient?</p>
      <p>
        Data will only be sent to MRC if/when at least one of the patient's renal units enrolls in MRC data sending.
      </p>
    </BaseModalConfirm>
    <BaseModalSuccess
      ref="createMrcMembershipSuccess"
      title="MRC Membership Created"
      confirm-label="Go back to records"
      @confirm="$emit('refresh')"
    >
      <p class="mb-4"><b>No data has been automatically sent</b></p>
      <p class="inline">To send data, click</p>
      <UButton label="Sync to MRC" size="xs" icon="i-heroicons-cloud-arrow-up-20-solid" class="cursor-default" />
      <p class="inline">from the Data Feeds section.</p>
    </BaseModalSuccess>

    <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
      <UButton
        :disabled="!menuAvailable"
        size="sm"
        label="Add Memberships"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </UDropdown>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import BaseModalConfirm from "~/components/base/BaseModalConfirm.vue";
import BaseModalSuccess from "~/components/base/BaseModalSuccess.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    BaseModalSuccess,
    BaseModalConfirm,
  },
  props: {
    records: {
      type: Array as () => PatientRecordSummarySchema[],
      required: true,
    },
    showCreatePkbMembership: {
      type: Boolean,
      required: false,
      default: false,
    },
    showCreateMrcMembership: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["refresh"],
  setup(props) {
    const { hasPermission } = usePermissions();
    const { ukrdcRecordGroupApi } = useApi();

    // Modals

    const createPkbMembershipConfirm = ref<ModalInterface>();
    const createPkbMembershipSuccess = ref<ModalInterface>();

    const createMrcMembershipConfirm = ref<ModalInterface>();
    const createMrcMembershipSuccess = ref<ModalInterface>();

    // Data refs

    const ukrdcids = computed<string[]>(() => {
      // Create an array from the unique set of UKRDC IDs of the related records
      return [...new Set(props.records.map((record) => record.ukrdcid))];
    });

    const menuAvailable = computed(() => {
      return hasPermission("ukrdc:memberships:create") && ukrdcids.value.length === 1;
    });

    function showCreatePkbMembershipConfirm() {
      createPkbMembershipConfirm.value?.show();
    }

    function showCreateMrcMembershipConfirm() {
      createMrcMembershipConfirm.value?.show();
    }

    function createPkbMembership() {
      ukrdcRecordGroupApi
        .postUkrdcidMembershipsCreatePkb({
          ukrdcid: ukrdcids.value[0],
        })
        .then(() => {
          createPkbMembershipSuccess.value?.show();
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    function createMrcMembership() {
      ukrdcRecordGroupApi
        .postUkrdcidMembershipsCreateMrc({
          ukrdcid: ukrdcids.value[0],
        })
        .then(() => {
          createMrcMembershipSuccess.value?.show();
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    const menuItems = [
      [
        {
          label: "Create PKB Membership",
          click: () => {
            showCreatePkbMembershipConfirm();
          },
          disabled: !props.showCreatePkbMembership,
        },
        {
          label: "Create MRC Membership",
          click: () => {
            showCreateMrcMembershipConfirm();
          },
          disabled: !props.showCreateMrcMembership,
        },
      ],
    ];

    return {
      createPkbMembershipConfirm,
      createPkbMembershipSuccess,
      createMrcMembershipConfirm,
      createMrcMembershipSuccess,
      ukrdcids,
      menuAvailable,
      menuItems,
      createPkbMembership,
      createMrcMembership
    };
  },
});
</script>
