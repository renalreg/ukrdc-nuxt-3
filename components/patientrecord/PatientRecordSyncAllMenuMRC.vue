<template>
  <div v-if="buttonAvailable">
    <BaseModalSuccess ref="startSyncSuccessModal" title="Started Syncing to MRC" confirm-label="Go back to records">
      <p class="mb-4"><b>This usually takes a few minutes</b></p>
      <p>We're syncing data to MRC in the background.</p>
      <p>Depending on the size of the records, this may take up to an hour.</p>
    </BaseModalSuccess>

    <BaseModalSuccess
      ref="startSyncFailureModal"
      title="Failure Syncing to MRC"
      confirm-label="Go back to records"
      :danger="true"
    >
      <p>
        Please use the
        <a
          class="font-medium text-indigo-600 hover:text-indigo-500"
          href="https://renalregistry.atlassian.net/servicedesk/customer/portals"
          target="blank"
          >UK Kidney Association Help Center</a
        >
        if this issue persists.
      </p>
      <p>Please copy the following debug information into your request:</p>
      <p class="mt-3 font-mono">exportAllToMRC.fail {{ failedPIDs }}</p>
    </BaseModalSuccess>

    <UTooltip
      :text="!hasMrcMembership ? 'Patient does not have a MRC membership record' : undefined"
      :prevent="hasMrcMembership"
    >
      <UButton
        label="Sync to MRC"
        size="sm"
        icon="i-heroicons-cloud-arrow-up-20-solid"
        :disabled="!hasMrcMembership || syncInProgress"
        @click="exportAllToMRC"
      />
    </UTooltip>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import BaseModalSuccess from "~/components/base/BaseModalSuccess.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    BaseModalSuccess,
  },
  props: {
    records: {
      type: Array as () => PatientRecordSummarySchema[],
      required: true,
    },
    hasMrcMembership: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { hasPermission } = usePermissions();
    const { patientRecordsApi } = useApi();

    // Modals
    const startSyncSuccessModal = ref<ModalInterface>();
    const startSyncFailureModal = ref<ModalInterface>();

    // Data refs
    const buttonAvailable = computed(() => {
      return hasPermission("ukrdc:records:export");
    });

    const syncInProgress = ref(false);
    const failedPIDs = ref<string[]>([]);

    // Sync functionality
    function exportAllToMRC() {
      // Do nothing if sync is already in progress or button is disabled
      if (!props.hasMrcMembership || syncInProgress.value) {
        return;
      }

      syncInProgress.value = true;

      // Create a set of promises, one for each record we're syncing
      const promises = props.records.map((record) => {
        return patientRecordsApi
          .postPatientExportMrc({ pid: record.pid })
          .then(() => {
            // Handle individual success if needed
          })
          .catch(() => {
            // Append failed PID
            failedPIDs.value.push(record.pid);
          });
      });

      // Execute all promises, and show an error modal if any fail, or success if all succeed
      Promise.allSettled(promises)
        .then(() => {
          if (failedPIDs.value.length === 0) {
            startSyncSuccessModal.value?.show();
          } else {
            startSyncFailureModal.value?.show();
          }
        })
        .finally(() => {
          // Uncomment the line below if you want to re-enable the Sync All button after the operation completes
          // syncInProgress.value = false;
        });
    }

    return {
      startSyncSuccessModal,
      startSyncFailureModal,
      buttonAvailable,
      syncInProgress,
      failedPIDs,
      exportAllToMRC,
    };
  },
});
</script>
