<script lang="ts">
export default defineComponent({
  setup() {
    const route = useRoute();
    navigateTo(`/facilities/${route.params.code}/overview`, { replace: true });
  },
});
</script>
