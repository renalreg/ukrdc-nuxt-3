<script lang="ts">
export default defineComponent({
  setup() {
    const route = useRoute();
    navigateTo(`/patientrecords/${route.params.pid}/overview`, { replace: true });
  },
});
</script>
