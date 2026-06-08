<template>
  <BaseLoadingContainer :loading="!survey">
    <div v-if="survey" class="sensitive">
      <UCard class="mb-4">
        <template #header>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Survey Information</h3>
          <p class="mt-1 max-w-2xl text-gray-500">
            {{ survey.id }}
          </p>
        </template>

        <BaseDescriptionListGrid>
          <BaseDescriptionListGridItem>
            <dt>Entered On</dt>
            <dd>
              {{ formatDate(survey.surveytime, false) }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Facility Code</dt>
            <dd>
              {{ survey.enteredatcode }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Entered By</dt>
            <dd>
              {{ survey.enteredbycode }}
            </dd>
          </BaseDescriptionListGridItem>
          <BaseDescriptionListGridItem>
            <dt>Survey Type Code</dt>
            <dd>
              {{ survey.surveytypecode }}
            </dd>
          </BaseDescriptionListGridItem>
        </BaseDescriptionListGrid>
      </UCard>

      <div v-for="(questions, group) in groupedQuestions" :key="group">
        <UCard :ui="{ body: { padding: '' } }" class="mb-4">
          <template #header>
            <h3>
              {{ group ?? "Ungrouped" }}
            </h3>
          </template>
          <UTable :data="questions" :columns="columns" />
        </UCard>
      </div>
    </div>
  </BaseLoadingContainer>
</template>

<script lang="ts">
import type { PatientRecordSchema, SurveyQuestionSchema, SurveySchema } from "@ukkidney/ukrdc-axios-ts";

import BaseDescriptionListGrid from "~/components/base/BaseDescriptionListGrid.vue";
import BaseDescriptionListGridItem from "~/components/base/BaseDescriptionListGridItem.vue";
import BaseLoadingContainer from "~/components/base/BaseLoadingContainer.vue";
import useApi from "~/composables/useApi";
import { formatDate } from "~/helpers/dateUtils";

interface GroupedQuestions {
  [key: string]: SurveyQuestionSchema[];
}

export default defineComponent({
  components: {
    BaseLoadingContainer,
    BaseDescriptionListGrid,
    BaseDescriptionListGridItem,
  },
  props: {
    record: {
      type: Object as () => PatientRecordSchema,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    const { patientRecordsApi } = useApi();

    // Data refs
    const survey = ref<SurveySchema>();

    // Data fetching
    onMounted(() => {
      patientRecordsApi
        .getPatientSurveys({
          pid: props.record.pid,
        })
        .then((response) => {
          const surveys: SurveySchema[] = response.data;

          const thisSurvey = surveys.find((element) => element.id === route.params.surveyid);

          if (!thisSurvey) {
            throw createError({
              statusCode: 404,
              statusMessage: "Survey Not Found",
            });
          }

          survey.value = thisSurvey;
        })
        .catch(() => {
          // Error handling is centralized in the Axios interceptor
          // Handle UI state reset or fallback values here if needed
        });
    });

    const groupedQuestions = computed(() => {
      if (!survey.value?.questions) {
        return {};
      }
      const groups = {} as GroupedQuestions;
      for (const question of survey.value.questions) {
        if (!question.questionGroup) {
          question.questionGroup = "Ungrouped";
        }
        if (question.questionGroup && !(question.questionGroup in groups)) {
          groups[question.questionGroup] = [];
        }
        groups[question.questionGroup ?? "Ungrouped"].push(question);
      }
      return groups;
    });

    const columns = [
      {
        id: "questiontypecode",
        accessorKey: "questiontypecode",
        header: "Question code",
      },
      {
        id: "questionType",
        accessorKey: "questionType",
        header: "Question type",
      },
      {
        id: "response",
        accessorKey: "response",
        header: "Response code",
      },
      {
        id: "responseText",
        accessorKey: "responseText",
        header: "Response text",
      },
    ];

    return {
      survey,
      groupedQuestions,
      columns,
      formatDate,
    };
  },
});
</script>
