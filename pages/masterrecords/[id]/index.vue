<script lang="ts">
export default defineComponent({
  setup() {
    const route = useRoute();
    navigateTo(`/masterrecords/${route.params.id}/overview`);
  },
});
</script>
