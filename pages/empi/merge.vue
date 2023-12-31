<template>
  <div>
    <BaseModalConfirm
      ref="beginMergeAlert"
      title="Begin Record Merge"
      message="Are you sure you want to begin merging these records?"
      icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      :danger="true"
      @confirm="requestMerge()"
    />

    <div class="mx-auto mb-4 max-w-7xl">
      <h1>Merge Records</h1>
    </div>

    <div class="mb-6 block gap-2 lg:flex">
      <div class="flex-1">
        <div v-if="superseded">
          <UButton size="lg" class="w-full" @click="clearSuperceeded"> Change Source Record </UButton>
          <NuxtLink :to="`/masterrecords/${superseded.id}`">
            <MasterRecordCard
              class="mt-4 !border-red-500"
              :record="superseded"
              :label="`Superseded Record ${superseded.id.toString()}`"
              :highlight="highlightSections"
            />
          </NuxtLink>
        </div>
        <div v-else>
          <EMPISearch v-if="searchingFor === 'superseded'" :number-types="['UKRDC']" @select="selectSuperceeded" />
          <UButton v-else size="lg" class="w-full" @click="searchingFor = 'superseded'"> Search for a Record </UButton>
        </div>
      </div>

      <div class="my-4 flex flex-none flex-row justify-center lg:my-0 lg:flex-col lg:justify-start">
        <div class="flex-shrink">
          <UTooltip text="Switch Records">
            <UButton square size="lg" icon="i-heroicons-arrows-right-left-20-solid" @click="switchRecords" />
          </UTooltip>
        </div>
        <div class="hidden flex-grow flex-col items-center justify-center lg:flex">
          <div v-show="superseded && superseding" class="h-8">
            <UIcon name="i-heroicons-arrow-right" class="mx-auto my-2 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      <div class="flex-1">
        <div v-if="superseding">
          <UButton size="lg" class="w-full" @click="clearsuperseding"> Change Destination Record </UButton>
          <NuxtLink :to="`/masterrecords/${superseding.id}`">
            <MasterRecordCard
              class="mt-4 !border-green-500"
              :record="superseding"
              :label="`Superseding Record ${superseding.id.toString()}`"
              :highlight="highlightSections"
            />
          </NuxtLink>
        </div>
        <div v-else>
          <EMPISearch v-if="searchingFor === 'superseding'" :number-types="['UKRDC']" @select="selectsuperseding" />
          <UButton v-else size="lg" class="w-full" @click="searchingFor = 'superseding'"> Search for a Record </UButton>
        </div>
      </div>
    </div>

    <UAlert
      v-if="mergeBlockDescription"
      color="orange"
      icon="i-heroicons-exclamation-triangle-20-solid"
      class="mb-4"
      :title="mergeBlockDescription"
    />

    <UAlert
      v-if="highlightSections.length > 0"
      color="red"
      icon="i-heroicons-exclamation-triangle-20-solid"
      class="mb-4"
      :title="`You are about to merge records with mismatching demographics for: ${highlightSections.join(', ')}`"
    />

    <div v-if="readyToMerge">
      <div class="mb-6">
        <h2 class="mb-2">Merge Details</h2>
        <p>
          Master Record <b class="text-red-700">{{ supersededId }}</b> will be replaced by Master Record
          <b class="text-green-600">{{ supersedingId }}</b
          >.
        </p>
        <p>
          All Patient Records linked to Master Record <b class="text-red-700">{{ supersededId }}</b> will be re-linked
          to Master Record <b class="text-green-600">{{ supersedingId }}</b
          >.
        </p>
      </div>

      <div class="flex gap-2">
        <UButton colour="red" @click="beginMergeAlert?.show()">Begin Record Merge</UButton>
        <UButton v-if="callbackPath" :to="callbackPath">Cancel</UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type MasterRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseModalConfirm from "~/components/base/BaseModalConfirm.vue";
import EMPISearch from "~/components/EMPISearch.vue";
import MasterRecordCard from "~/components/MasterRecordCard.vue";
import useQuery from "~/composables/query/useQuery";
import useApi from "~/composables/useApi";
import { type ModalInterface } from "~/interfaces/modal";

type Direction = "superseding" | "superseded";

export default defineComponent({
  components: {
    BaseModalConfirm,
    MasterRecordCard,
    EMPISearch,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const { stringQuery } = useQuery();
    const { patientIndexOperationsApi, masterRecordsApi } = useApi();

    // Modals

    const beginMergeAlert = ref<ModalInterface>();

    // Data refs

    const supersededId = stringQuery("superseded", undefined, true, false);
    const supersedingId = stringQuery("superseding", undefined, true, false);
    const callbackPath = stringQuery("callback", undefined);

    const superseded = ref<MasterRecordSchema>();
    const superseding = ref<MasterRecordSchema>();

    const searchingFor = ref<Direction>();

    const readyToMerge = computed(() => {
      return superseded.value?.id && superseding.value?.id && superseded.value?.id !== superseding.value?.id;
    });

    const mergeBlockDescription = computed(() => {
      if (superseded.value?.id && superseding.value?.id) {
        if (superseded.value?.id === superseding.value?.id) {
          return "A record cannot be merged into itself. Please select a different record on one side.";
        }
        if (superseded.value?.nationalidType !== superseding.value?.nationalidType) {
          return `You are about to merge a ${superseded.value?.nationalidType} record into a ${superseding.value?.nationalidType} record.`;
        }
      }
      return "";
    });

    // Data fetching
    function fetchRecords() {
      if (supersededId.value) {
        masterRecordsApi
          .getMasterRecord({
            recordId: Number(supersededId.value),
          })
          .then((response) => {
            superseded.value = response.data;
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          });
      }
      if (supersedingId.value) {
        masterRecordsApi
          .getMasterRecord({
            recordId: Number(supersedingId.value),
          })
          .then((response) => {
            superseding.value = response.data;
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          });
      }
    }

    onMounted(() => {
      fetchRecords();
    });

    watch([supersededId, supersedingId], () => {
      fetchRecords();
    });

    // Record card style

    const highlightSections = computed<string[]>(() => {
      if (!(superseding.value && superseded.value)) {
        return [];
      }
      const highlight = [];
      if (
        superseding.value.givenname !== superseded.value.givenname ||
        superseding.value.surname !== superseded.value.surname
      ) {
        highlight.push("name");
      }
      if (superseding.value.dateOfBirth !== superseded.value.dateOfBirth) {
        highlight.push("dateOfBirth");
      }
      if (superseding.value.gender !== superseded.value.gender) {
        highlight.push("gender");
      }
      return highlight;
    });

    // Edit merge functions

    function switchRecords() {
      const newQuery = Object.assign({}, route.query);
      if (supersedingId.value) {
        newQuery.superseded = [supersedingId.value];
      }
      if (supersededId.value) {
        newQuery.superseding = [supersededId.value];
      }
      router.push({
        path: route.path,
        query: newQuery,
      });
    }

    function clearMerge() {
      superseding.value = undefined;
      superseded.value = undefined;
      searchingFor.value = undefined;
      const newQuery = Object.assign({}, route.query);
      newQuery.superseded = [null];
      newQuery.superseding = [null];
      router.push({
        path: route.path,
        query: newQuery,
      });
    }

    function clearsuperseding() {
      superseding.value = undefined;
      supersedingId.value = undefined;
      searchingFor.value = "superseding";
    }

    function clearSuperceeded() {
      superseded.value = undefined;
      supersededId.value = undefined;
      searchingFor.value = "superseded";
    }

    function selectsuperseding(id: string) {
      supersedingId.value = id;
    }

    function selectSuperceeded(id: string) {
      supersededId.value = id;
    }

    // Do merge

    function requestMerge() {
      if (superseded.value && superseding.value) {
        patientIndexOperationsApi
          .postEmpiMerge({
            mergeRequest: {
              superseded: superseded.value.id,
              superseding: superseding.value.id,
            },
          })
          .then(() => {
            toast.add({
              title: "Success",
              description: "Record merge request sent successfully",
            });
            clearMerge();
            if (callbackPath.value) {
              router.push(callbackPath.value);
            }
          })
          .catch(() => {
            // Error handling is centralized in the Axios interceptor
            // Handle UI state reset or fallback values here if needed
          })
          .finally(() => {
            const el = beginMergeAlert.value as ModalInterface;
            el.hide();
          });
      }
    }

    return {
      beginMergeAlert,
      supersededId,
      supersedingId,
      callbackPath,
      superseded,
      superseding,
      searchingFor,
      highlightSections,
      clearsuperseding,
      clearSuperceeded,
      selectsuperseding,
      selectSuperceeded,
      switchRecords,
      readyToMerge,
      mergeBlockDescription,
      requestMerge,
    };
  },
});
</script>
