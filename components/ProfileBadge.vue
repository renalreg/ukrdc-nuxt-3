<template>
  <UDropdown :items="menuItems" class="w-full">
    <UButton variant="ghost" class="my-1 w-full sm:my-0" label="Manage profile">
      <div class="flex w-full items-center gap-4">
        <UAvatar icon="i-heroicons-user-circle" size="md" class="flex-0" />
        <div class="flex-1">
          <p class="text-left text-base font-medium text-gray-700 group-hover:text-gray-900">
            {{ displayName }}
          </p>
        </div>
        <UIcon class="flex-0 h-4 w-4" name="i-heroicons-chevron-down-16-solid" />
      </div>
    </UButton>
  </UDropdown>
</template>

<script lang="ts">
import useAuth from "~/composables/useAuth";

export default defineComponent({
  setup() {
    const runtimeConfig = useRuntimeConfig();

    const { idToken, isAuthenticated, signOutAuto } = useAuth();

    // Menu
    const showMenu = ref(false);
    function closeMenu() {
      showMenu.value = false;
    }

    // User info
    const displayName = computed(() => {
      if (idToken.value) {
        return idToken.value.payload.name;
      }
      return "Signed Out";
    });

    const manageAccountUrl = runtimeConfig.public.manageAccountUrl;

    const menuItems = [
      [
        {
          label: "Profile and Settings",
          icon: "i-heroicons-user-circle-20-solid",
          to: "/profile",
        },
        {
          label: "Manage Account",
          icon: "i-heroicons-arrow-top-right-on-square-20-solid",
          to: manageAccountUrl,
        },
      ],
      [
        {
          label: "Support",
          icon: "i-heroicons-lifebuoy-20-solid",
          to: "/system",
        },
      ],
      [
        {
          label: "Background Tasks",
          icon: "i-heroicons-command-line-20-solid",
          to: "/tasks",
        },
      ],
      [
        {
          label: "Logout",
          icon: "i-heroicons-arrow-left-on-rectangle-20-solid",
          click: () => {
            signOutAuto();
          },
        },
      ],
    ];

    return {
      isAuthenticated,
      displayName,
      showMenu,
      manageAccountUrl,
      menuItems,
      closeMenu,
      signOutAuto,
    };
  },
});
</script>

<style></style>
