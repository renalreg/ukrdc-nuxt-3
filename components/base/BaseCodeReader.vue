<template>
  <div>
    <div v-if="contentType === 'XML'" class="border-b border-gray-200 pb-3 pl-8 pt-3">
      <div class="flex gap-2">
        <UToggle v-model="formatMessage" name="Format XML" size="lg" color="green" />
        <span class="font-medium text-gray-900">Format XML </span>
      </div>
    </div>

    <div v-if="content" class="box-border px-4 text-left font-mono text-sm">
      <code class="mt-2 block whitespace-pre">{{ formattedMessage }}</code>
    </div>
    <div v-else>Empty file</div>
  </div>
</template>

<script lang="ts">
import formatXml from "xml-formatter";

export default defineComponent({
  props: {
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const formatMessage = ref(true);
    const formattedMessage = computed(() => {
      return formatMessageToXML(props.content);
    });

    function formatMessageToXML(content: string): string {
      if (content === null) {
        return "";
      }
      if (!formatMessage.value) {
        return content;
      } else {
        return formatXml(content);
      }
    }

    return {
      formatMessage,
      formattedMessage,
    };
  },
});
</script>
