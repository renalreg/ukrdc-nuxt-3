<template><span /></template>

<script setup lang="ts">
const route = useRoute();
navigateTo(`/patientrecords/${route.params.pid}/overview`, { replace: true });
</script>
