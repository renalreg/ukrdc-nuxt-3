<template>
  <div class="sensitive">
    <BaseLoadingContainer :loading="!documents">
      <p v-if="documents && documents.length <= 0" class="text-center">No documents on record</p>
      <UCard v-else :ui="{ body: { padding: '' } }">
        <ul class="divide-y divide-gray-300">
          <li v-for="item in documents" :key="item.id" :item="item" class="hover:bg-gray-50">
            <NuxtLink :to="`/patientrecords/${$route.params.pid}/medical/documents/${item.id}`">
              <PatientRecordDocumentListItem :item="item" />
            </NuxtLink>
          </li>
        </ul>

        <template #footer>
          <BasePaginator :page="page" :size="size" :total="total" @next="page++" @prev="page--" @jump="page = $event" />
        </template>
      </UCard>
    </BaseLoadingContainer>
  </div>
</template>

<script lang="ts">
import { type DocumentSummarySchema, type PatientRecordSchema } from "@ukkidney/ukrdc-axios-ts";

import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import BasePaginator from "~/components/base/BasePaginator.vue";
import PatientRecordDocumentListItem from "~/components/patientrecord/medical/PatientRecordDocumentListItem.vue";
import useDateRange from "~/composables/query/useDateRange";
import usePagination from "~/composables/query/usePagination";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BasePaginator,
    PatientRecordDocumentListItem,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },
  setup(props) {
    const { page, total, size } = usePagination();
    const { makeDateRange } = useDateRange();
    const { patientRecordsApi } = useApi();

    // Set initial date dateRange
    const dateRange = makeDateRange(null, null, true, false);

    // Data refs

    const documents = ref<DocumentSummarySchema[]>();

    // Data fetching

    function getDocuments() {
      patientRecordsApi
        .getPatientDocuments({
          pid: props.record.pid,
          page: page.value ?? 1,
          size: size.value,
        })
        .then((response) => {
          documents.value = response.data.items;
          total.value = response.data.total ?? 0;
          page.value = response.data.page ?? 0;
          size.value = response.data.size ?? 0;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    }

    onMounted(() => {
      getDocuments();
    });

    watch(page, () => {
      getDocuments();
    });

    return {
      page,
      size,
      total,
      dateRange,
      documents,
      formatDate,
    };
  },
});
</script>

<style scoped></style>
