<!-- eslint-disable vue/no-v-html -->
<template>
  <BaseInfoModal>
    <div class="space-y-4 p-4 [&>ul]:list-inside [&>ul]:list-disc" v-html="sanitisedDescriptionHTML"></div>
  </BaseInfoModal>
</template>

<script lang="ts">
import DOMPurify from "dompurify";
import { marked } from "marked";

import BaseInfoModal from "~/components/base/BaseInfoModal.vue";

export default defineComponent({
  components: {
    BaseInfoModal,
  },
  props: {
    descriptionMarkdown: {
      type: String,
      required: true,
      default: undefined,
    },
  },

  setup(props) {
    const sanitisedDescriptionHTML = computed<String>(() => {
      if (!props.descriptionMarkdown) {
        return "No description available";
      }
      return DOMPurify.sanitize(marked.parse(props.descriptionMarkdown) as string);
    });

    return {
      sanitisedDescriptionHTML,
    };
  },
});
</script>
