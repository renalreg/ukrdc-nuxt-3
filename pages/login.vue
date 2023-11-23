<template>
  <div class="justify-center text-center">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Signing you in...
    </h2>
  </div>
</template>

<script lang="ts">
import useAuth from "~/composables/useAuth";

export default defineComponent({
  // Override auth middleware. We handle redirects here ourselves in mounted()
  auth: false,

  setup() {
    const { $okta } = useNuxtApp();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const route = useRoute();

    onBeforeMount(async () => {
      try {
        console.log($okta);
        // If an originalUri was stored before navigating to this page, keep using it
        let originalUri = $okta.getOriginalUri();
        // Original URI should never be the login page (otherwise you just get stuck here)
        if (originalUri && originalUri !== route.path) {
          originalUri = undefined;
        }
        console.log({ originalUri });

        if ($okta.isLoginRedirect()) {
          // If we're in the middle of a sign-in flow
          // Fetch tokens and redirect back to originalUri
          console.log("$okta.isLoginRedirect()");
          await $okta.handleRedirect();
        } else if (!isAuthenticated.value) {
          // Start sign-in flow
          console.log("!isAuthenticated.value");
          await $okta.signInAuto(originalUri || "/");
        } else if (originalUri) {
          console.log("originalUri");
          // If we're signed in and an originalUri somehow exists
          router.replace({ path: originalUri });
        } else {
          console.log("else");
          // If we're signed in and no originalUri exists
          // Redirect to home
          router.replace({ path: "/" });
        }
      } catch (e) {
        console.error(e);
      }
    });
  },
  head: {
    title: "Login",
  },
});
</script>
