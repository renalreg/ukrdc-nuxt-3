<template>
  <div>
    <PatientRecordDeleteModal ref="deleteModal" :item="item" @deleted="$emit('deleted')" />

    <UDropdown :items="menuItems" class="h-full" :popper="{ placement: 'right-start' }">
      <UButton
        color="gray"
        variant="ghost"
        class="z-0 flex h-full items-center hover:bg-gray-50"
        icon="i-heroicons-ellipsis-vertical"
      />
    </UDropdown>
  </div>
</template>

<script lang="ts">
import { type PatientRecordSummarySchema } from "@ukkidney/ukrdc-axios-ts";

import PatientRecordDeleteModal from "~/components/patientrecord/PatientRecordDeleteModal.vue";
import useApi from "~/composables/useApi";
import usePermissions from "~/composables/usePermissions";
import { demographicsUpdateAllowed } from "~/helpers/recordUtils";
import { type ModalInterface } from "~/interfaces/modal";

export default defineComponent({
  components: {
    PatientRecordDeleteModal,
  },
  props: {
    item: {
      type: Object as () => PatientRecordSummarySchema,
      required: true,
    },
    showRadarSync: {
      type: Boolean,
      required: false,
      default: false,
    },
    showPkbSync: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ["deleted"],
  setup(props) {
    const toast = useToast();
    const { hasPermission } = usePermissions();
    const { patientRecordsApi } = useApi();

    const deleteModal = ref<ModalInterface>();

    function copyPID() {
      navigator.clipboard.writeText(props.item.pid).then(() => {
        toast.add({
          title: "Success",
          description: "PID copied to clipboard",
        });
      });
    }

    function showDeleteModal() {
      deleteModal.value?.show();
    }

    function showExportSuccessToast() {
      // Notify of task finished
      toast.add({
        title: "Sync Started",
        description: "This may take a few minutes depending on the size of the record.",
      });
    }

    function showExportErrorToast(e: Error) {
      // Notify of task error
      toast.add({
        title: "Sync Failed",
        color: "red",
        description: e.message,
      });
    }

    function exportRADARandCloseMenu() {
      patientRecordsApi
        .postPatientExportRadar({ pid: props.item.pid })
        .then(() => {
          showExportSuccessToast();
        })
        .catch((e) => {
          showExportErrorToast(e);
        });
    }

    function exportPKBandCloseMenu() {
      patientRecordsApi
        .postPatientExportPkb({ pid: props.item.pid })
        .then(() => {
          showExportSuccessToast();
        })
        .catch((e) => {
          showExportErrorToast(e);
        });
    }

    const menuItems = [
      [
        {
          label: "Copy PID",
          icon: "i-heroicons-document-duplicate-20-solid",
          click: () => {
            copyPID();
          },
        },
      ],
      [
        {
          label: "Sync record to PKB",
          icon: "i-heroicons-cloud-arrow-up-20-solid",
          click: () => {
            exportPKBandCloseMenu();
          },
          disabled: !(hasPermission("ukrdc:records:export") && (props.showRadarSync || props.showPkbSync)),
        },
        {
          label: "Sync record to RADAR",
          icon: "i-heroicons-cloud-arrow-up-20-solid",
          click: () => {
            exportRADARandCloseMenu();
          },
          disabled: !(hasPermission("ukrdc:records:export") && (props.showRadarSync || props.showPkbSync)),
        },
      ],
      [
        {
          label: "Edit demographics",
          icon: "i-heroicons-pencil-20-solid",
          to: `/patientrecords/${props.item.pid}/update/demographics`,
          disabled: !(hasPermission("ukrdc:records:write") && demographicsUpdateAllowed(props.item)),
        },
        {
          label: "Delete record",
          icon: "i-heroicons-trash-20-solid",
          click: () => {
            showDeleteModal();
          },
          disabled: !hasPermission("ukrdc:records:delete"),
        },
      ],
    ];

    return {
      deleteModal,
      menuItems,
      copyPID,
      showDeleteModal,
      hasPermission,
      exportRADARandCloseMenu,
      exportPKBandCloseMenu,
    };
  },
});
</script>
